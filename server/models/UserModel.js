import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username:{type:String, required: true, trim:true},
    email:{type:String, required: true, unique: true, lowercase:true, trim:true},
    password: {type:String, required: false},
    github_id: {type:String, unique:true, sparse:true},
    avatarUrl:{type:String, required:false, default: null},
}, {timestamps: true});

userSchema.index({ email: 1, role: 1 });

const User = mongoose.model('User', userSchema);
export default User;