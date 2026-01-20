"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const activity_service_1 = require("./activity.service");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../../common/decorators");
const client_1 = require("@prisma/client");
let ActivityController = class ActivityController {
    constructor(activityService) {
        this.activityService = activityService;
    }
    findAll(user, limit) {
        return this.activityService.findAll(user.id, limit ? parseInt(limit, 10) : 50);
    }
    findByEntity(entityType, entityId) {
        return this.activityService.findByEntity(entityType, entityId);
    }
};
exports.ActivityController = ActivityController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all activity logs for authenticated developer' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Activity logs retrieved successfully' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ActivityController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':entityType/:entityId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get activity logs for a specific entity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Activity logs retrieved successfully' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ActivityController.prototype, "findByEntity", null);
exports.ActivityController = ActivityController = __decorate([
    (0, swagger_1.ApiTags)('activity-logs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Controller)('activity-logs'),
    __metadata("design:paramtypes", [activity_service_1.ActivityService])
], ActivityController);
//# sourceMappingURL=activity.controller.js.map