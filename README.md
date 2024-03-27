# serverless
Cloud Functions

## Implementing Serverless Architecture with Google Cloud Functions
Welcome to the repository dedicated to enabling serverless architecture utilizing Google Cloud Functions. In this setup, our focus is on facilitating email verification for new user accounts within a web application.
## Getting Started
To commence your journey with this project, adhere to the steps outlined below:
   ```
1. **Install Dependencies:** Proceed to the project directory and execute the following command to install the requisite dependencies via npm:
   ```bash
   cd serverless
   npm install
   ```
2. **Configure Environment Variables:** Within the root directory of the project, create a `.env` file and append the following environment variables:
   ```dotenv
   MAILGUN_API_KEY=your_mailgun_api_key
   MAILGUN_DOMAIN_NAME=your_mailgun_domain
   MAILGUN_FROM_ADDRESS="Firstname Lastname <firstnamelastname.me>"
   VERIFICATION_EMAIL_LINK=https://example.com/verify
   DATABASE_NAME=webapp
   DATABASE_USERNAME=webapp
   DATABASE_PASSWORD=password
   DATABASE_HOST=localhost
   ```
3. **Set Up Pub/Sub Topic and Subscription:** Create a topic named `verify_email` and establish a subscription for the Cloud Function. Configure the data retention period for the topic to be 7 days.
## Implementation Insights
### Cloud Function
The Cloud function, dubbed `sendEmailWithVerificationLink`, gets triggered by a Pub/Sub message upon the creation of a new user account. It undertakes the following tasks:
- Dispatches a verification link to the user's email for email address confirmation. Note that the link's validity expires after 2 minutes.
- Maintains a record of dispatched emails in a CloudSQL instance, leveraging the same instance and database utilized by the web application.
### Package.json
The `package.json` file delineates the dependencies indispensable for the project's functionality.







