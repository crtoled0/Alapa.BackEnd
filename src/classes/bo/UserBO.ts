import GlobObjs from '../common/GlobObjs'
import auth from '../../classes/common/Auth';
import {UserModel, GenUserInter, NotificationModel,
        FeedbackModel, GSPTrackerModel} from '../../models';
import * as _ from 'lodash';
import * as mom from 'moment';

import Tools from '../common/Tools';

class UserBO {
        private currUser: GenUserInter;
        private sess: GlobObjs;
        private logger;

        constructor() {
            this.sess = new GlobObjs();
            this.logger = this.sess.getLogger();
           // this.currUser = <GenUserInter> _.pick(this.sess.get('me'), ['_id', 'userid', 'fullName']);
            if (!this.sess.get('me')) {
                this.resolveUser();
            }
        }
        /**
         * @param user: <User>Object
         */
        public getUserFromFacebook(user: Object): Object {
            return {};
        }

        private resolveUser() {
            let me = this;
            let token = this.sess.get('token');
            let usr = auth.decodeUser(token);
            this.logger.info('resolveUser', usr);
            UserModel.findById(usr._id)
            .then(doc => {
                if (doc.activeToken === token)
                        me.sess.set('me', usr);
            })
            .catch(err => {
                me.logger.error('Error Resolving User', err);
            });
        }

        private getCurrentUser() {
            return this.sess.get('me');
        }

        /**
         * @param user: <UserModel>Object
         * @param callback: Function
         */
        public registerUser(user: any, callback: Function): void {
            let tools = new Tools();
            if (user.avatarImg)
                user.avatarImg = tools.uploadImage(user.avatarImg);
            let newUsr = new UserModel(user);
            newUsr.setPassword(user.password);
            newUsr.save((err, usr) => {
                if (err) {
                    callback({ok: false, err: err});
                }
                callback({ok: true, user: {_id: usr._id} });
            });
        }

        /**
         * @param user: <UserModel>Object
         * @param callback: Function
         */
        public updateUser(user: any, callback: Function): void {
            let currUser = this.getCurrentUser();
            console.log(user, currUser);
            if(user.image){
                console.log(user.image, currUser);
            }
            if (!currUser || !currUser._id || currUser._id !== user._id)
                    return callback({ok: false, status: 401, error: {msg: 'Not logged or wrong not allowed to edit user'}});
            UserModel.findById(currUser._id)
            .then(doc => {
                let tools = new Tools();
                if (user.password)
                    doc.setPassword(user.password);
                if (user.avatarImg)
                    doc.avatarImg = tools.uploadImage(user.avatarImg);
                doc.avatarImg = user.avatarImg;
                doc.displayName = user.displayName;
                doc.fullName = user.fullName;
                doc.save();
                return callback({ok: true, user: _.omit(doc, [ 'hash', '__v', 'activeToken', 'salt'])});
            })
            .catch(err => {
                return callback({ok: false, error: err});
            });
            // callback({ok: true, msg: 'TODO: Implement Fnc updateUser', params: {user: user}});
        }

        /**
         * @param token: String
         * @param callback: Function
         */
        public refreshSession(token: any, callback: Function): void {
            let usr = auth.decodeUser(token);
            this.logger.info('refreshSession', usr);
            UserModel.findById(usr._id)
            .then(doc => {
                this.sess = new GlobObjs();
                this.sess.set('me', doc);
             //   this.currUser = <GenUserInter> _.pick(this.sess.get('me'), ['_id', 'userid', 'fullName']);
                callback({ok: true, user: doc.toAuthJSON(), refreshed: true});
            })
            .catch(err => {
                return callback({ok: false, error: err});
            });
        }

        /**
         * @param user: <UserModel>Object
         * @param callback: Function
         */
        public getProfile(user: any, callback: Function): void {
            let packToReceive = 2, retObj = {user: null, feedback: []};
            UserModel.findById(user._id)
            .then(doc => {
                packToReceive--;
                retObj.user = doc;
                if (packToReceive <= 0)
                    return callback({ok: true, item: retObj});
            })
            .catch(err => {
                return callback({ok: false, error: err});
            });
            FeedbackModel.find({'to._id': user._id})
            .then(docs => {
                packToReceive--;
                retObj.feedback = docs;
                if (packToReceive <= 0)
                    return callback({ok: true, item: retObj});
            })
            .catch(err => {
                return callback({ok: false, error: err});
            });
            // callback({ok: true, msg: 'TODO: Implement Fnc getProfile', params: {user: user}});
         }

        /**
         * @param user: <UserModel>Object
         * @param callback: Function
         */
        public getMyProfile(callback: Function): void {
            let currUser = this.getCurrentUser();
            if (!currUser || !currUser._id)
                    return callback({ok: false, error: {msg: 'Not logged user'}});
            UserModel.findById(currUser._id)
            .then(doc => {
                callback({ok: true, item: doc});
            })
            .catch(err => {
                return callback({ok: false, error: err});
            });
            // callback({ok: true, msg: 'TODO: Implement Fnc getProfile', params: {user: user}});
         }

        /**
         * @param users: <UserModel>[Object]
         * @param callback: Function
         */
        public getProfilesSummary(props: any, callback: Function): void {
            let {users} = props;
            UserModel.find({_id: _.map(users, '_id')})
            .then(docs => {
                callback({ok: true, item: docs});
            })
            .catch(err => {
                return callback({ok: false, error: err});
            });
            // callback({ok: true, msg: 'TODO: Implement Fnc getProfilesSummary', params: {users: users}});
         }

        /**
         * @param posted: <UserModel>Object
         * @param feedback: <FeedbackModel>Object
         * @param callback: Function
         */
        public addFeedback(feedback: any, callback: Function): void {
            let currUser = this.getCurrentUser();
            let feedNewDoc = {
                to: feedback.to,
                from: currUser,
                evaluation: feedback.evaluation,
                feed: feedback.feed,
                evaluateAs: feedback.evaluateAs,
            };
            let newFeed = new FeedbackModel(feedNewDoc);
            newFeed.save()
            .then(doc => {
                callback({ok: true, feed: doc });
            })
            .catch(err => {
                callback({ok: false, err: err});
            });
            // callback({ok: true, msg: 'TODO: Implement Fnc addFeedback', params: {posted: posted, feedback: feedback}});
         }

        /**
         * @param callback: Function
         */
        public toogleFindMeMode(callback: Function): void {
            let currUser = this.getCurrentUser();
            if (!currUser) {
                return callback({ok: false, error: {code: 'session_expired', msg: 'Session expired'}});
            }
            console.log(currUser);
            UserModel.findById(currUser._id)
            .then(async (user) => {
              console.log(user);
              user.findmeActive = !user.findmeActive;
              user.save((err, user) => {
                if (err) {
                    return callback({ok: false, error: err});
                }
                console.log(user);
                return callback({ok: true, findmeActive: user.findmeActive});
              });
            }).catch((err) => {
                 return callback({ok: false, error: err});
            });
           // return callback({ok: true, msg: 'TODO: Implement Fnc toogleFindMeMode', params: {state: state}});
        }

        /**
         * @param coords: <GPSCoord>Object
         * @param callback: Function
         */
        public refreshMyGPSCoord(coords: any, callback: Function): void {
            let currUser = this.getCurrentUser();
            let trackNewDoc = {
                trackedUser: currUser,
                coords: coords,
            };
            let newtrack = new GSPTrackerModel(trackNewDoc);
            newtrack.save()
            .then(doc => {
                return callback({ok: true, track: doc });
            })
            .catch(err => {
                return callback({ok: false, err: err});
            });
            // callback({ok: true, msg: 'TODO: Implement Fnc refreshMyGPSCoord', params: {coords: coords}});
        }

        /**
         * @param observer: <UserModel>Object
         * @param callback: Function
         */
        public addMeObserver(observer: any, callback: Function): void {
            let currUser = this.getCurrentUser();
            UserModel.findById(currUser._id)
            .then(doc => {
                doc.observers.push(observer);
                doc.observers = <[GenUserInter]>_.uniqBy(doc.observers, '_id');
                doc.save()
                .then(res => {
                    return callback({ok: true, item: res});
                })
                .catch(err => {
                    return callback({ok: false, err: err});
                });

            })
            .catch(err => {
                return callback({ok: false, err: err});
            });
            // callback({ok: true, msg: 'TODO: Implement Fnc addMeObserver', params: {observer: observer}});
        }

        /**
         * @param observer: <UserModel>Object
         * @param callback: Function
         */
        public removeMeObserver(observer: any, callback: Function): void {
            let currUser = this.getCurrentUser();
            UserModel.findById(currUser._id)
            .then(doc => {
                doc.observers = <[GenUserInter]> _.remove(doc.observers, {_id: observer._id});
                doc.save()
                .then(res => {
                    return callback({ok: true, item: res});
                })
                .catch(err => {
                    return callback({ok: false, err: err});
                });
            })
            .catch(err => {
                return callback({ok: false, err: err});
            });
            // callback({ok: true, msg: 'TODO: Implement Fnc removeMeObserver', params: {observer: observer}});
        }

        /**
         * @param callback: Function
         */
        public getMyObservers(callback: Function): void {
            let currUser = this.getCurrentUser();
            UserModel.findById(currUser._id)
            .then(doc => {
                return callback({ok: true, items: doc.observers});
            })
            .catch(err => {
                return callback({ok: false, err: err});
            });
            // callback({ok: true, msg: 'TODO: Implement Fnc getMyObservers'});
        }

        /**
         * @param filter: Object
         * @param callback: Function
         */
        public searchUsers(props: any, callback: Function): void {
            let {keyword} = props;
            UserModel.find({$or: [{ userid: new RegExp(keyword, 'ig') },
                                  { displayName: new RegExp(keyword, 'ig') },
                                  { fullName: new RegExp(keyword, 'ig') },
                                  { email: new RegExp(keyword, 'ig') }],
                           })
            .then(docs => {
                return callback({ok: true, items: docs});
            })
            .catch(err => {
                return callback({ok: false, err: err});
            });
            // callback({ok: true, msg: 'TODO: Implement Fnc searchUsers', params: {filter: filter}});
        }

        /**
         * @param callback: Function
         */
        public getUsersICanObserve(callback: Function): void {
            let currUser = this.getCurrentUser();
            UserModel.find({'observers._id': currUser._id})
            .then(docs => {
                return callback({ok: true, items: docs});
            })
            .catch(err => {
                return callback({ok: false, err: err});
            });
            // callback({ok: true, msg: 'TODO: Implement Fnc getUsersICanObserve'});
        }

        /**
         * @param user: <UserModel>Object
         * @param dateFilter: <Date>String
         * @param callback: Function: Returns GPSCoord
         */
        public checkUserPositionInTime(props: any, callback: Function): void {
           let {user, dateFrom, dateTo} = props;
           let filters = {trackedUser: user};
           if (dateFrom){
               dateTo = dateTo || dateFrom;
               dateFrom = mom(dateFrom, 'MM.DD.YYYY hh:mm a');
               dateTo = mom(dateTo, 'MM.DD.YYYY hh:mm a');
               filters = _.extend(filters, {whenTmp: {$gte: dateFrom.toDate(), $lte: dateTo.toDate()}});
           }
           GSPTrackerModel.find(filters)
           .sort({whenTmp: 'desc'})
           .then(docs => {
                return callback({ok: true, items: docs});
           })
           .catch(err => {
                return callback({ok: false, err: err})
           });
            // callback({ok: true, msg: 'TODO: Implement Fnc checkUserPositionInTime' , params: {user: user, dateFilter: dateFilter}});
        }

        /**
         * @param user: <UserModel>Object
         * @param msg: String
         * @param callback: Function
         */
        public raiseNotification(props: any, callback: Function): void {
            let currUser = this.getCurrentUser();
            let {user, msg} = props;
            let newMsgDoc = {to: user,
                            from: currUser,
                            notType: 'tipea',
                            msg: msg};
            let newNotif = new NotificationModel(newMsgDoc);
            newNotif.save()
            .then(doc => {
                    return callback({ok: true, track: doc });
            })
            .catch(err => {
                    return callback({ok: false, err: err});
            });
           // callback({ok: true, msg: 'TODO: Implement Fnc raiseNotification', params: {user: user, msg: msg}});
        }
};
export default UserBO;
