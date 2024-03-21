const express = require('express');
const route = express.Router();
const controller = require('../controllers/user_controller');
const authenticate = require('../middleware/std_token');

route.post('/signup',controller.user_signup);
route.post('/login',controller.user_login);
route.get('/getuser',authenticate,controller.get_user)

module.exports = route;
