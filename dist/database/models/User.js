"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../connection");
const bcrypt = __importStar(require("bcryptjs"));
class User extends sequelize_1.Model {
    // Virtual getter for username (for compatibility)
    get username() {
        return this.email || this.name;
    }
    // Virtual getter for isActive (for compatibility)
    get isActive() {
        return this.status === 'active';
    }
    // Method to compare password
    async comparePassword(candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    }
    // Method to get user role from database
    async getRole() {
        try {
            const [result] = await connection_1.sequelize.query(`
        SELECT r.name as role_name 
        FROM model_has_roles mhr 
        JOIN roles r ON mhr.role_id = r.id 
        WHERE mhr.model_type = 'App\\\\Models\\\\User' AND mhr.model_id = ?
      `, {
                replacements: [this.id]
            });
            return result[0]?.role_name || 'User';
        }
        catch (error) {
            console.error('Error getting user role:', error);
            return 'User';
        }
    }
    // Method to hash password
    async hashPassword() {
        if (this.changed('password')) {
            const saltRounds = 12;
            this.password = await bcrypt.hash(this.password, saltRounds);
        }
    }
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    slug: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    google_token: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    mobile: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    email_verified_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    password_show: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    fcm_token: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    fcm_token_enable: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    app_version: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    profile: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    location: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    user_current_lat: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    user_current_long: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    dob: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    gender: {
        type: sequelize_1.DataTypes.ENUM('male', 'female', ''),
        allowNull: false,
        defaultValue: '',
    },
    vehicle_type: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    vehicle_number: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    driving_licence_front: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    driving_licence_back: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
    },
    remember_token: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    otp: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    otp_verify: {
        type: sequelize_1.DataTypes.ENUM('0', '1'),
        allowNull: false,
        defaultValue: '0',
    },
    login_with: {
        type: sequelize_1.DataTypes.ENUM('facebook', 'google', 'app'),
        allowNull: false,
        defaultValue: 'app',
    },
    aadhar_front: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    aadhar_back: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    aadhar_number: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    aadhar_verify_status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'inactive',
    },
    rc_image: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    driving_licence_expiry_date: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    current_wallet_balance: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    case_collect: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    is_top: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    delete_account_request: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeSave: async (user) => {
            await user.hashPassword();
        },
    },
});
exports.default = User;
//# sourceMappingURL=User.js.map