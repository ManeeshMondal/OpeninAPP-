const task_db = require('../models/task')
const { body, validationResult } = require('express-validator');
const user_db = require('../models/user')
const twilio = require('twilio');
const accountSid = 'YOUR_ACCOUNT_SID'; // make it env variables
const authToken = 'YOUR_AUTH_TOKEN';


exports.get_tasks = async (req, res) => {
    try {
        const { numericFilters, status, page, limit } = req.query;
        const queryObject = {
            userId: req.user.id,
            deleted_at: null // Exclude soft-deleted tasks
        };

        if (status) {
            queryObject.status = status;
        }

        if (numericFilters) {
            const operatorMap = {
                '>': '$gt',
                '>=': '$gte',
                '=': '$eq',
                '<': '$lt',
                '<=': '$lte',
            };

            const regEx = /\b(<|>|>=|=|<|<=)\b/g;
            let filters = numericFilters.replace(
                regEx,
                (match) => `-${operatorMap[match]}-`
            );

            const options = ['priority', 'due_Date'];
            filters = filters.split('&&').forEach((item) => {
                const [field, operator, value] = item.split('-');
                if (options.includes(field)) {
                    queryObject[field] = { [operator]: Number(value) };
                }
            });
        }

        let result = await task_db.find(queryObject);
        const pageNo = Number(page) || 1;
        const Limit = Number(limit) || 10;
        const skip = (pageNo - 1) * Limit;

        result = result.skip(skip).limit(limit);

        // Update priorities for tasks
        for (let i = 0; i < result.length; i++) {
            const task = result[i];
            const today = new Date();
            const dueDate = new Date(task.due_Date);
            const timeDiff = dueDate.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

            let priority;
            if (daysDiff === 0) {
                priority = 0;
            } else if (daysDiff <= 2) {
                priority = 1;
            } else if (daysDiff <= 4) {
                priority = 2;
            } else {
                priority = 3;
            }

            await task_db.findByIdAndUpdate(task._id, { priority });
        }

        const tasks = await result;
        res.status(200).json({ tasks, Length: tasks.length });
    } catch (err) {
        res.status(500).send({
            message: err.message || "Internal Server Error"
        });
    }
}

//------------------------------------------------------------------
exports.add_task = [
    body('name', 'Task must be of at least 5 characters').isLength({ min: 5 }),
    // body('due_Date', 'Enter a valid date').isISO8601(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;

        const { name, due_Date, status } = req.body;

        let priority;
        const today = new Date();
        const dueDate = new Date(due_Date);
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff === 0) {
            priority = 0; // Due date is today
        } else if (daysDiff <= 2) {
            priority = 1; // Due date is between tomorrow and day after tomorrow
        } else if (daysDiff <= 4) {
            priority = 2; // Due date is within next 4 days
        } else {
            priority = 3; // Due date is 5 days or more away
        }

        const task = new task_db({
            name,
            due_Date,
            status,
            priority,
            userId
        });

        try {
            const savedTask = await task.save();
            res.status(200).json({ success: true, task: savedTask });
        } catch (err) {
            res.status(500).send({
                message: err.message || "Internal Server Error"
            });
        }
    }
];



//--------------------------------------------------------------------------------
exports.deleteTask = async (req, res) => {
    try {
        let task = await task_db.findOne({ _id: req.params.id, userId: req.user.id });

        if (!task) {
            return res.status(404).send("Not Found");
        }
        task.deleted_at = new Date();
        await task.save();

        res.status(200).json({ msg: "Success", task });

    } catch (error) {
        console.error(error.message);
        res.status(500).send({
            message: error.message || "Internal Server Error"
        });
    }
};

exports.editTask=([
    body('name', 'Task must be of atleast 5 characters').isLength({ min: 5 }),
    body('due_Date', 'Enter a valid date ').isISO8601(),
], async (req, res) => {

    const { name, due_Date, status } = req.body;

    const newtask = {};


    if (name) {
        newtask.name = name;
    }
    if (status) {
        newtask.status = status;
    }
    if (due_Date) {
        newtask.due_Date = due_Date;
    }

    let task = await task_db.findOne({ _id: req.params.id, userId: req.user.id });

    if (!task) {
        return res.status(404).send("Not Found");
    }
    try {
        task = await task_db.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { $set: newtask }, { new: true })
        res.status(200).json({ "success": true, task });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Internal Server Error"
        })
    }
});

//---------------------------------------------------------- 
exports.get_Alltasks = async (req, res) => {
    try {
        const today = new Date();
        
        // finding overdue tasks
        const tasks = await task_db.find({ due_Date: { $lt: today } });

        // Extracting user IDs associated with these tasks
        const userIds = tasks.map(task => task.userId);

        const users = await user_db.find({ _id: { $in: userIds } }).sort({ priority: 1 });

        for (let i=0;i<users.length;i++) {
            let user = users[i];

            // Checking if the user should be called
            if (!user.called ) {

                await callUser(user.phone_number);

                user.called = true;
                await user.save();
            }
        }

        res.status(200).json({ message: "Voice calls initiated for overdue tasks" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send({
            message: err.message || "Internal Server Error"
        });
    }
};

async function callUser(receiverPhoneNumber) {

    const client = twilio(accountSid, authToken);

    try {
        await client.calls.create({
            twiml: '<Response><Say>Hello! This is a reminder for your overdue task.</Say></Response>',
            to: receiverPhoneNumber,
            from: 'YOUR_TWILIO_PHONE_NUMBER'
        });
    } catch (error) {
        console.error("Twilio call error:", error);
    }
}