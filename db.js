

import { Sequelize } from 'sequelize';

require('dotenv').config();

export const db = new Sequelize({
	host: process.env.DB_HOST,
	password: process.env.DB_PASSWORD,
	username: process.env.DB_USER,
	port: process.env.DB_PORT,
	dialect: 'postgres',
});