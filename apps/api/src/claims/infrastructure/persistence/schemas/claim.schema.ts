import { Schema, Document } from 'mongoose';
import { ClaimStatus } from '../../../domain/value-objects/claim-status.enum';
import { DamageSchema, DamageDocument } from './damage.schema';

export interface ClaimDocument extends Document<string> {
  _id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  damages: DamageDocument[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const ClaimSchema: Schema<ClaimDocument> = new Schema<ClaimDocument>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ClaimStatus),
      required: true,
      default: ClaimStatus.Pending,
    },
    damages: [DamageSchema],
    totalAmount: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
