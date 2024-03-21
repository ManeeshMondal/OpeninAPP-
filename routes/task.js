const express = require('express');
const route = express.Router();
const controller = require('../controllers/task_controller');
const authenticate = require('../middleware/std_token');

route.post('/addTask',authenticate,controller.add_task);
route.get('/getTasks',authenticate,controller.get_tasks);
route.get('/getAllasks',controller.get_Alltasks);
route.patch('/editTask/:id',authenticate,controller.editTask);
route.delete('/deleteTask/:id',authenticate,controller.deleteTask);

module.exports = route;
