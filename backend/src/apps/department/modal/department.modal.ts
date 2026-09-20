import { Schema, model, Document } from 'mongoose';

export interface IDepartment extends Document {
    name: string;
    code: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true, // e.g. "STAT" — stored consistently regardless of input case
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export const Department = model<IDepartment>('Department', departmentSchema);