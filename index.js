import { cloudEvent } from "@google-cloud/functions-framework";
import mailgun from "mailgun-js";
import { DataTypes, Model, Sequelize } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

// Variables
dotenv.config();
const mailgunApiKey = process.env.MAILGUN_API_KEY || "xxx";
const mailgunDomain = process.env.MAILGUN_DOMAIN || "firstnamelastname.me";
const mailgunFrom =
  process.env.MAILGUN_FROM || "Firstname Lastname <firstnamelastname.me>";
const verifyEmailLink =
  process.env.VERIFY_EMAIL_LINK || "https://example.com/verify";
const postgresDBName = process.env.DATABASE_NAME || "webapp";
const postgresDBUser = process.env.DATABASE_USER || "webapp";
const postgresDBPassword = process.env.DATABASE_PASSWORD || "password";
const postgresDBHost = process.env.DATABASE_HOST || "localhost";

// Clients
const mailgunClient = mailgun({ apiKey: mailgunApiKey, domain: mailgunDomain });
export const postgresDBConnection = new Sequelize(
  postgresDBName,
  postgresDBUser,
  postgresDBPassword,
  {
    host: postgresDBHost,
    dialect: "postgres",
  }
);

// Models
export const User = postgresDBConnection.define(
  "User",
  {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    account_created: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    account_updated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    verification_email_sent_timestamp: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    user_verification_status : {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
  }, 
  {
    tableName: 'users',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['username']
        }
    ],
    updatedAt: 'account_updated', // Map updatedAt to account_updated
    createdAt: 'account_created', // Map createdAt to account_created
  }
);

cloudEvent("sendVerifyEmail", async (payload) => {
  const payloadMessage = payload.data.message.data;

  const message = JSON.parse(Buffer.from(payloadMessage, "base64").toString());

  const token = message.id;
  const email = message.email;

  await sendVerificationEmail(email, token);
});

export const sendVerificationEmail = async (email, token) => {
  const emailData = {
    from: mailgunFrom,
    to: email,
    subject: "Webapp: Verify your email address",
    text: `Click here to verify your email:\n${verifyEmailLink}/${token}\n`,
  };

  mailgunClient.messages().send(emailData, async (error, body) => {
    if (error) {
      console.error(
        `[Cloud Function: Send Verification Email] Error sending verification email to ${email}, error:` +
          error.message
      );
    } else {
      console.info(
        `[Cloud Function: Send Verification Email] Verification email sent to ${email} with id ${token} and messageId ${body.id}`
      );
      await updateVerificationEmailSentTimestamp(token);
    }
  });
};

export const updateVerificationEmailSentTimestamp = async (token) => {
  const currentTimestamp = new Date();
  try {
    const user = await User.findOne({
      where: {
        id: token,
      },
    });
    user.verification_email_sent_timestamp = currentTimestamp;
    await user.save();

    console.info(
      `[Cloud Function: Send Verification Email] ${user.id} verification email sent at ${currentTimestamp}`
    );
  } catch (error) {
    console.error(
      `[Cloud Function: Send Verification Email] Error updating verification email sent timestamp for ${token}, error:` +
        error.message
    );
  }
};