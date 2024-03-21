const express = require('express');
const route = express.Router();
const controller = require('../controllers/subtask_controller');
const authenticate = require('../middleware/std_token');

route.post('/addSubTask/:id',authenticate,controller.addSub_task);
route.get('/getSubTasks/:id',authenticate,controller.getSubtasks);
route.put('/editSubTask/:taskId/:subTaskId',authenticate,controller.editSubTask);
route.delete('/deleteSubTask/:taskId/:subTaskId',authenticate,controller.deleteSubTask);

module.exports = route;
 