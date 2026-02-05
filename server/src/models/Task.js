import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    estimatedTime: {
        type: Number, // in minutes
        default: 30
    },
    dueDate: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // tomorrow
    },
    status: {
        type: String,
        enum: ['todo', 'done'],
        default: 'todo'
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Task', taskSchema);
