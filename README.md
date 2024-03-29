# GetYourRide: Project Setup 
1. Install nodeJs https://nodejs.org/en/download
2. Install MongoDB with MongoDBCompass https://www.mongodb.com/try/download/community
	
### Setup Database:
1. create one directory with name **Database**
2. open terminal Choose your database path to store database and its configuration, just enter this below command in terminal
    ```mongod --dbpath ./Database```
    make sure your database directory path is correct

3. Now open your project where you will find below directory structure
	```
	|-BackEnd
	|-FrontEnd
	    |-get-your-ride
	```
	For BackEnd : Open BackEnd directory in terminal and type **npm install**
	to install existing packages
	```npm install```
	
	Once you finish, to start nodeJs backend server you can 
	type **npm index.js or nodemon**
	```npm index.js``` or ```nodemon```
	
	For FrontEnd: Open FrontEnd directory ( FrontEnd > get-your-ride ) in terminal and type npm install to install existing packages
				  
    Once you done with installation, type below command in terminal to start ReactJs FrontEnd server **npm start**
    ```npm start```
				  
### Required steps you have to complete

1. GeoAPIFy Account : Create GeoAPIFy account for map related process
	
	- Go to https://myprojects.geoapify.com/register register and login
	- Create new project in geoapify
	- Go to Project > Api Key then copy your key and paste it in below files
	- BackEnd > config.js 
    	```js
        const GEOAPIFY_API_KEY = "<Paste in this variable>"
        ```
	- FrontEnd > get-your-ride > src > components > Helper > config.js
		```js
        const GEOAPIFY_API_KEY = "<Paste in this variable>"
        ```
	
2. Gmail App Password Setup : For ContactUs email sending process
	- Go to https://myaccount.google.com/security open
	- Enable 2FA (Two factor authentication).
	- After enabling the two factor authentication, click on app password.
	- Search App Password
	- Create App Password for Email, select mail for app and you can give custom name for device.
	- Copy that password (16 characters) into the pass parameter in nodemailer authentication(auth).
	- BackEnd > config.js
		// Gmail App Password
		```js
        const SEND_GMAIL_PASSWORD = "<YOUR_GMAIL_APP_PASSWORD>";
        ```

	- Now add sender email address and receiver email address In BackEnd > config.js
		
		// This gmail account is used in previous steps to get app password
		```js
        const SEND_GMAIL_ADDRESS = "<YOUR_SENDER_GMAIL>";
        ```
	
		// Where Email receivered with customer details
		```js
		const RECEIVER_GMAIL_ADDRESS = "YOUR_RECEIVE_GMAIL";
		```

3. Now setup RazorPay for payment gateway use

	- Go to https://easy.razorpay.com/onboarding/l1/signup?field=MobileNumber register & login
	- Go to Account & Settings > API Keys
		https://dashboard.razorpay.com/app/website-app-settings/api-keys
	- Now click on Regenerate key, then copy that generated API Key & API Secret paste in below file
	- BackEnd > config.js
		```js
        const RAZORPAY_API_KEY = "API_KEY";
		const RAZORPAY_API_SECRET = "API_SECRET";
        ```
		
