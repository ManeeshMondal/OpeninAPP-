const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: {type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true},
    name: {
        type: String,
        required: true
    },
    status:{
        type: Number,
        enum: [0, 1], // 0: uncompleted, 1: completed
        default: 0
    },
    created_at:{
        type: Date,
        
    },
    updated_at:{
        type: Date,
        default: null
    },
    deleted_at:{
        type: Date,
        default:null
    }
});


const TaskModel = mongoose.model('SubTask', subtaskSchema);

module.exports = TaskModel;
