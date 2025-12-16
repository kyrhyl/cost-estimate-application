import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  projectName: string;
  projectLocation: string;
  district: string;
  implementingOffice: string;
  appropriation: number;
  contractId?: string;
  projectType?: string;
  status: 'Planning' | 'Approved' | 'Ongoing' | 'Completed' | 'Cancelled';
  startDate?: Date;
  endDate?: Date;
  description?: string;
  haulingCostPerKm?: number;
  distanceFromOffice?: number;
  haulingConfig?: {
    materialName?: string;
    materialSource?: string;
    totalDistance?: number;
    freeHaulingDistance?: number;
    routeSegments?: Array<{
      terrain?: string;
      distanceKm: number;
      speedUnloadedKmh: number;
      speedLoadedKmh: number;
    }>;
    equipmentCapacity?: number;
    equipmentRentalRate?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    projectName: {
      type: String,
      required: true
    },
    projectLocation: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true,
      default: 'Bukidnon 1st'
    },
    implementingOffice: {
      type: String,
      required: true,
      default: 'DPWH Bukidnon 1st District Engineering Office'
    },
    appropriation: {
      type: Number,
      required: true,
      default: 0
    },
    contractId: {
      type: String,
      default: ''
    },
    projectType: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Planning', 'Approved', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Planning'
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    description: {
      type: String,
      default: ''
    },
    haulingCostPerKm: {
      type: Number,
      min: 0,
      default: 0,
    },
    distanceFromOffice: {
      type: Number,
      min: 0,
      default: 0,
    },
    haulingConfig: {
      type: Schema.Types.Mixed,
      default: null,
    }
  },
  {
    timestamps: true
  }
);

// Indexes
ProjectSchema.index({ projectLocation: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ contractId: 1 });

// Clear cached model in development to ensure schema updates are applied
if (process.env.NODE_ENV === 'development' && mongoose.models.Project) {
  delete mongoose.models.Project;
}

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
