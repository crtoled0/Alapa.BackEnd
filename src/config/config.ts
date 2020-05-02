import { sync } from 'glob';
import { union } from 'lodash';

export default class Config {
  public static port: number = 9005
  public static appName: string = 'alapa';
  public static environment: string = 'dev';
  public static routes: string = './dist/routes/**/*.js'
  public static models: string = './dist/models/**/*.js'
  public static logsPath: string = './logs';
  public static useMongo: boolean = true;
  public static mongodb = 'mongodb://apps_usr:123123123@mongolnk:27017/alapa';
  public static globFiles(location: string): string[] {
    return union([], sync(location))
  }
}
