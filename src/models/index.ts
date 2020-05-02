import { model, Schema, connection, Document } from 'mongoose';
import * as moment from 'moment';

export interface GenUserInter extends Document {
  _id: Schema.Types.ObjectId,
  userid: string,
  fullName: string,
  avatarImg: string,
};
export interface GPSCoordsInter extends Document {
  lat: number,
  lon: number,
};

const Generic = {
   User: {
          _id: {type: Schema.Types.ObjectId},
          userid: {type: String},
          fullName: {type: String},
   },
   GPSCoord: {
      lat: {type: Schema.Types.Number},
      lon: {type: Schema.Types.Number},
   },
};

// --------------------------------------------------------------------------------------------

export { default as UserModel } from './UserModel';

// --------------------------------------------------------------------------------------------
export interface NotificationInter extends Document {
  to: GenUserInter,
  from: GenUserInter,
  notType: string,
  msg: string,
  read: Boolean,
}

let NotificationSchema = new Schema({
  to: {
    type: Generic.User,
    required: true,
  },
  from: {
    type: Generic.User,
    required: true,
  },
  notType: {
      type: String,
      enum: ['tipea', 'tipeb'],
  },
  read: {
    type: Boolean,
    default: false,
  },
  msg: {
    type: String,
    required: true,
  },
});

export const NotificationModel = model<NotificationInter>('Notification', NotificationSchema);

// --------------------------------------------------------------------------------------------
export interface FeedbackInter extends Document {
  to: GenUserInter,
  from: GenUserInter,
  evaluation: number,
  feed: string,
  evaluateAs: string
}

let FeedbackSchema = new Schema({
  to: {
    type: Generic.User,
    required: true,
  },
  from: {
    type: Generic.User,
    required: true,
  },
  evaluation: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
  },
  feed: {
    type: String,
    required: true,
  },
  evaluateAs: {
    type: String,
    enum: ['driver', 'passenger'],
  },
});

export const FeedbackModel = model<FeedbackInter>('Feedback', FeedbackSchema);

// --------------------------------------------------------------------------------------------
export interface GSPTrackerInter extends Document {
  trackedUser: GenUserInter,
  whenTmp: Date,
  coords: {},
}

let GSPTrackerSchema = new Schema({
  trackedUser: {
    type: Generic.User,
    required: true,
  },
  whenTmp: {
    type: Schema.Types.Date,
    required: true,
    default: moment(),
  },
  coords: { type: {}, index: '2dsphere', sparse: true },
});

export const GSPTrackerModel = model<GSPTrackerInter>('GSPTracker', GSPTrackerSchema);

// --------------------------------------------------------------------------------------------
export interface LocationInter extends Document {
  _id: Schema.Types.ObjectId,
  coords: {},
  city: string,
  country: string,
  tags: [string]
}

let LocationSchema = new Schema({
  coords: { type: {}, index: '2dsphere', sparse: true },
  city: {type: String, required: true,},
  country: {type: String,},
  tags: {
    type: [String],
  },
});

export const LocationModel = model<LocationInter>('Location', LocationSchema);

// --------------------------------------------------------------------------------------------
export interface TripInter extends Document {
    departureDate: Date,
    departureTime: string,
    origin: LocationInter,
    destiny: LocationInter,
    availableSeats: number,
    departureCoords: { type: {}, index: '2dsphere', sparse: true },
    state: string,
    scheduled: string,
    driver: GenUserInter,
    passengers: [GenUserInter],
    tripRequesters: [GenUserInter],
    requestOpen: boolean,
}

let TripSchema = new Schema({
    departureDate: {type: Date, required: true},
    departureTime: {type: Schema.Types.String},
    origin: {
      coords: { type: {}, index: '2dsphere', sparse: true },
      city: {type: String, required: true, },
      country: {type: String, },
    },
    destiny: {
      coords: { type: {}, index: '2dsphere', sparse: true },
      city: {type: String, required: true, },
      country: {type: String, },
    },
    availableSeats: {type: Number, required: true},
    departureCoords: { type: {}, index: '2dsphere', sparse: true },
    state: {type: String, enum: ['pending', 'norequest', 'started', 'finished'], default: 'pending'},
    scheduled: {type: String, enum: ['once', 'daily', 'weekly'], default: 'once'},
    driver: Generic.User,
    passengers: [Generic.User],
    tripRequesters: [Generic.User],
    requestOpen: {type: Boolean, default: true},
});

export const TripModel = model<TripInter>('Trip', TripSchema);

// --------------------------------------------------------------------------------------------
export interface InvoiceTripInter extends Document {
  driver: GenUserInter,
  amountUSD: number,
  status: string,
  trip: Schema.Types.ObjectId,
  emited: Date,
  passengerCount: number,
}

let InvoiceTripSchema = new Schema({
  driver: Generic.User,
  amountUSD: {type: Number},
  status: {type: String, enum: ['pending', 'cancelled', 'payed']},
  trip: {type: Schema.Types.ObjectId},
  emited: {type: Date},
  passengerCount: {type: Number},
});

export const InvoiceTripModel = model<InvoiceTripInter>('InvoiceTrip', InvoiceTripSchema);
