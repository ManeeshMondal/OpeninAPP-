const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    deleted_at: {
        type: Date,
        default: null
    },
    due_Date: {
        type: Date,
        default: Date.now // Set default value to the current date
    },
    status: {
        type: String,
        enum: ["TODO", "IN_PROGRESS", "DONE"],
        default: "TODO"
    },
    priority: {
        type: Number,
        enum: [0, 1, 2, 3]
    }
});

const TaskModel = mongoose.model('Task', taskSchema);

module.exports = TaskModel;
