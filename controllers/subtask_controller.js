const subtask_db = require('../models/subtask');
const { body, validationResult } = require('express-validator');
const task_db = require('../models/task');


exports.getSubtasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.query.task_id; // Use req.query to get the taskId from the query parameters

        // Constructing the query object to find subtasks based on userId and optionally taskId
        const query = { userId, deleted_at: null }; // Exclude soft-deleted subtasks

        if (taskId) {
            query.taskId = taskId;
        }

        // Finding subtasks based on the constructed query
        const subtasks = await subtask_db.find(query);

        // Sending the subtasks as the response
        res.status(200).json(subtasks);
    } catch (err) {
        // Handling errors
        res.status(500).send({
            message: err.message || "Internal Server Error"
        });
    }
}


//------------------------------------------------------------------
exports.addSub_task = [
    body('name', 'Task must be of at least 5 characters').isLength({ min: 5 }),
    body('status', 'Status must be either 0 or 1').isIn([0, 1]),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const taskId = req.params.id;
        const { name, status } = req.body;

        const subtask = new subtask_db({
            name,
            created_at: Date.now(),
            status,
            userId, taskId
        });

        try {
            const savedTask = await subtask_db.create({
                name,
                created_at: Date.now(),
                status,
                userId, taskId
            });
            res.status(200).json({ success: true, subtask: savedTask });
        } catch (err) {
            res.status(500).send({
                message: err.message || "Internal Server Error"
            });
        }
    }
];



//--------------------------------------------------------------------------------
exports.deleteSubTask = async (req, res) => {
    console.log("req.params.subTaskId", req.params.subTaskId)
    try {
        let subtask = await subtask_db.findByIdAndDelete({
            _id: req.params.subTaskId
        });

        if (!subtask) {
            return res.status(404).send("Not Found");
        }




        subtask.deleted_at = new Date();
        await subtask.save();

        res.status(200).json({ msg: "Success", subtask });

    } catch (error) {
        console.error(error.message);
        res.status(500).send({
            message: error.message || "Internal Server Error"
        });
    }
};


exports.editSubTask = ([
    body('name', 'Task must be at least 5 characters long').isLength({ min: 5 }),
    body('status', 'Status must be either 0 or 1').isIn([0, 1]),
], async (req, res) => {
    const { name, status } = req.body;

    const updatedFields = {};

    if (name) {
        updatedFields.name = name;
    }
    if (status !== undefined) {
        updatedFields.status = status;
    }

    try {
        let subtask = await subtask_db.findByIdAndUpdate(
            { 
                _id: req.params.subTaskId,
            },
            { $set: updatedFields },
            { new: true }
        );

        console.log({subtask})

        if (!subtask) {
            return res.status(404).send("Subtask not found");
        }

        // Update the updated_at field
        subtask.updated_at = new Date();
        await subtask.save();

        res.status(200).json({ success: true, subtask });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({
            message: error.message || "Internal Server Error"
        });
    }
});





