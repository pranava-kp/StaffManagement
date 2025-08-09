
# StaffManagement
Staff management project for college

**Requirements**
Node.js 22.17
Mongo DB Sever

**Steps**
1. Fill the empty .env files in server and staff-management directories
2. In 2 separate terminals run the following
   
| **Starting the server** 	| **Starting the client** 	|
|:-----------------------:	|:-----------------------:	|
|       `cd server`       	|  `cd staff-management`  	|
|      `npm install`      	|      `npm install`      	|
|       `npm start`       	|       `npm start`       	|


## Contents of `.env` in StaffManagement/server
### ⚠️⚠️Update with MongoDB URL correctly⚠️⚠️
```# Mail Setup
MAIL_USER=
MAIL_HOST=
MAIL_PASSWORD=
MAIL_PORT=
MAIL_SECURE=false

#Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=

# MongoDB
MONGO_URL="mongodb://127.0.0.1:27017/staff_management"
PORT=2000

#JWT Setup
JWT_SECRET=

# Misc.
FRONTEND_URL=
NODE_ENV=development
```
## Contents of `.env` in StaffManagement/staff-management
### ⚠️⚠️Update with the IP returned by the server correctly⚠️⚠️
```
REACT_APP_BASE_URL="http://localhost:2000/api/v1"
```
