# RE-Miner Dashboard

The RE-Miner Dashboard is a software component within the RE-Miner Ecosystem, illustrated in the figure below.

![RE-Miner-Ecosystem](https://github.com/gessi-chatbots/RE-Miner-Dashboard/assets/55029168/08cfdc74-1154-4ea0-a2de-2cab3786845d)

## Description

The RE-Miner Dashboard [RE-Miner Dashboard](https://uat.reminer-app) (still in development). Is an analytical and visualization tool. This software component comprises several integral elements:

1. **React Front-end Application**
2. **Authorization & Authentication System**
3. **API Gateway**
4. **Backend:**
    - Applications API
    - Reviews API
    - User creation module
5. **NoSQL Document-Based Database**

### User cases

The user engagement follows a structured workflow. Upon user creation, access permissions to the application and associated APIs are granted. Once an user is authenticated, the dashboard provides two primary user cases:
| User Case                  | Description                                                                                     | Image |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ----- |
| Single Review Analysis     | Users can select an application review and extract its features and/or emotions using some of the RE-Miner integrated NLP Models.                | ![reviewAnalysis](https://github.com/gessi-chatbots/RE-Miner-Dashboard/assets/55029168/6276bd65-57f4-41c4-b460-07ed9526c118.png) |
| Batch Review Analysis and Visual Analytics | Users can select multiple application reviews, extract features and/or emotions using RE-Miner integrated NLP Models, and analyze key statistical charts via the Dashboard. | ![Dashboard](https://github.com/gessi-chatbots/RE-Miner-Dashboard/assets/55029168/dd505437-d8c9-4c89-a000-504873558d60.png)  |

## Technologies
| Technology                 | Description                               |
| -------------------------- | ----------------------------------------- |
| React                      | Frontend application                      |
| Amazon Cognito             | Authentication and Authorization          |
| AWS API Gateway            | API Management                            |
| AWS Lambda                 | Serverless API Coding                     |
| DynamoDB                   | NoSQL Database                            |
| AWS Amplify Framework      | Resource Provisioning and CI/CD           |

## How to Install
### Frontend React Application

1. **Clone the repository:**

    ```bash
    git clone https://github.com/gessi-chatbots/RE-Miner-Dashboard
    cd RE-Miner-Dashboard
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

### AWS Amplify Backend

#### Prerequisites

- [Amplify CLI installed](https://docs.amplify.aws/cli/start/install)

#### Steps

1. **Configure Amplify:**

    ```bash
    amplify configure
    ```

    Follow the prompts to set up your AWS credentials and region.

2. **Initialize Amplify:**

    ```bash
    amplify init
    ```

    Follow the prompts to initialize your Amplify project.

3. **Add backend services:**

    ```bash
    amplify add auth # for Cognito
    amplify add api # for API Gateway
    amplify add storage # for DynamoDB
    ```
4. **Create the lambda functions**
   ```bash
    amplify add function
   ```
   - Select Python runtime.
   - Copy paste the source code from the [3 functions](/amplify/backend/function)
   - Create a `backend_url` environment variable and assign the [RE-Miner HUB URL](https://github.com/gessi-chatbots/RE-Miner-HUB)
   - In the Amplify console copy & paste the [amplify.yml](amplify.yml) for correct building

## How to deploy
### **Deploy backend:**

```bash
    amplify push
```

This will create and configure the backend resources in your AWS account.
    
### **Deploy frontend:**

```bash
    npm run build
    amplify publish # if you want to deploy it as well in AWS
```
## License
This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html) - see the [LICENSE.md](LICENSE.md) file for details.



