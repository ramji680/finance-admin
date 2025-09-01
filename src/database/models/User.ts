import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../connection';
import * as bcrypt from 'bcryptjs';

export interface UserAttributes {
  id: number;
  slug?: string;
  google_token?: string;
  name: string;
  email?: string;
  mobile?: string;
  email_verified_at?: Date;
  password: string;
  password_show?: string;
  fcm_token?: string;
  fcm_token_enable: number;
  app_version?: string;
  profile?: string;
  location?: string;
  user_current_lat?: string;
  user_current_long?: string;
  dob?: string;
  gender: 'male' | 'female' | '';
  vehicle_type?: string;
  vehicle_number?: string;
  driving_licence_front?: string;
  driving_licence_back?: string;
  status: 'active' | 'inactive';
  remember_token?: string;
  otp?: string;
  otp_verify: '0' | '1';
  login_with: 'facebook' | 'google' | 'app';
  aadhar_front?: string;
  aadhar_back?: string;
  aadhar_number?: string;
  aadhar_verify_status: 'active' | 'inactive';
  rc_image?: string;
  driving_licence_expiry_date?: string;
  current_wallet_balance: number;
  case_collect: number;
  is_top: number;
  delete_account_request: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'fcm_token_enable' | 'gender' | 'status' | 'otp_verify' | 'login_with' | 'aadhar_verify_status' | 'current_wallet_balance' | 'case_collect' | 'is_top' | 'delete_account_request' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public slug?: string;
  public google_token?: string;
  public name!: string;
  public email?: string;
  public mobile?: string;
  public email_verified_at?: Date;
  public password!: string;
  public password_show?: string;
  public fcm_token?: string;
  public fcm_token_enable!: number;
  public app_version?: string;
  public profile?: string;
  public location?: string;
  public user_current_lat?: string;
  public user_current_long?: string;
  public dob?: string;
  public gender!: 'male' | 'female' | '';
  public vehicle_type?: string;
  public vehicle_number?: string;
  public driving_licence_front?: string;
  public driving_licence_back?: string;
  public status!: 'active' | 'inactive';
  public remember_token?: string;
  public otp?: string;
  public otp_verify!: '0' | '1';
  public login_with!: 'facebook' | 'google' | 'app';
  public aadhar_front?: string;
  public aadhar_back?: string;
  public aadhar_number?: string;
  public aadhar_verify_status!: 'active' | 'inactive';
  public rc_image?: string;
  public driving_licence_expiry_date?: string;
  public current_wallet_balance!: number;
  public case_collect!: number;
  public is_top!: number;
  public delete_account_request!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual getter for username (for compatibility)
  get username(): string {
    return this.email || this.name;
  }

  // Virtual getter for isActive (for compatibility)
  get isActive(): boolean {
    return this.status === 'active';
  }

  // Method to compare password
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Method to get user role from database
  async getRole(): Promise<string> {
    try {
      const [result] = await sequelize.query(`
        SELECT r.name as role_name 
        FROM model_has_roles mhr 
        JOIN roles r ON mhr.role_id = r.id 
        WHERE mhr.model_type = 'App\\\\Models\\\\User' AND mhr.model_id = ?
      `, {
        replacements: [this.id]
      });
      
      return (result as any[])[0]?.role_name || 'User';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'User';
    }
  }

  // Method to hash password
  async hashPassword(): Promise<void> {
    if (this.changed('password')) {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    google_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    password_show: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    fcm_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fcm_token_enable: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    app_version: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    profile: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_current_lat: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_current_long: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    dob: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', ''),
      allowNull: false,
      defaultValue: '',
    },
    vehicle_type: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    vehicle_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    driving_licence_front: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    driving_licence_back: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    remember_token: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    otp: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    otp_verify: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
      defaultValue: '0',
    },
    login_with: {
      type: DataTypes.ENUM('facebook', 'google', 'app'),
      allowNull: false,
      defaultValue: 'app',
    },
    aadhar_front: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    aadhar_back: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    aadhar_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    aadhar_verify_status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'inactive',
    },
    rc_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    driving_licence_expiry_date: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    current_wallet_balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    case_collect: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    is_top: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    delete_account_request: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeSave: async (user: User) => {
        await user.hashPassword();
      },
    },
  }
);

export default User;
