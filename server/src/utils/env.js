import dotenv from "dotenv";
dotenv.config();

export default function env(key) {
	return process.env[key];
}
