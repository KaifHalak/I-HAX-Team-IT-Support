import express from "express"

const authRouter = express.Router();

import pkg from '@kinde-oss/kinde-nodejs-sdk';
const { KindeClient, GrantType } = pkg;

const options = {
	domain: process.env.KINDE_DOMAIN,
	clientId: process.env.KINDE_CLIENT_ID,
	clientSecret: process.env.KINDE_CLIENT_SECRET,
	redirectUri: process.env.KINDE_REDIRECT_URI,
	logoutRedirectUri: process.env.KINDE_LOGOUT_REDIRECT_URI,
	grantType: GrantType.PKCE
};

const kindeClient = new KindeClient(options);

authRouter.get("/login", kindeClient.login(), (req, res) => {

	return res.redirect("/");	
});

authRouter.get("/register", kindeClient.register(), (req, res) => {
	return res.redirect("/");
});

authRouter.get("/callback", kindeClient.callback(), (req, res) => {
    return res.redirect("/");
    });

authRouter.get("/logout", kindeClient.logout());

export default authRouter
