/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SubmissionsController } from './../controllers/public/submissions.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MediaController } from './../controllers/public/media.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ListingsController } from './../controllers/public/listings.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CitiesController } from './../controllers/public/cities.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CategoriesController } from './../controllers/public/categories.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AdminModerationController } from './../controllers/admin/moderation.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AdminAuthController } from './../controllers/admin/auth.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AdminListingsController } from './../controllers/admin/admin-listings.controller';
import { expressAuthentication } from './../middlewares/auth.middleware';
// @ts-ignore - no great way to install types from subpackage
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';

const expressAuthenticationRecasted = expressAuthentication as (req: ExRequest, securityName: string, scopes?: string[], res?: ExResponse) => Promise<any>;


// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "ListingType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["event"]},{"dataType":"enum","enums":["restaurant"]},{"dataType":"enum","enums":["facility"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubmissionResponseData": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "listingType": {"ref":"ListingType","required":true},
            "status": {"dataType":"string","required":true},
            "editToken": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_SubmissionResponseData_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"ref":"SubmissionResponseData","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiErrorDetail": {
        "dataType": "refObject",
        "properties": {
            "code": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "details": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"enum","enums":[false],"required":true},
            "error": {"ref":"ApiErrorDetail","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CategoryEnum": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["music"]},{"dataType":"enum","enums":["food_drink"]},{"dataType":"enum","enums":["sports"]},{"dataType":"enum","enums":["comedy"]},{"dataType":"enum","enums":["arts_culture"]},{"dataType":"enum","enums":["nightlife"]},{"dataType":"enum","enums":["religious"]},{"dataType":"enum","enums":["education"]},{"dataType":"enum","enums":["lifestyle"]},{"dataType":"enum","enums":["wellness"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventDetailsDto": {
        "dataType": "refObject",
        "properties": {
            "startDateTime": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"}],"required":true},
            "endDateTime": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "isRecurring": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RestaurantDetailsDto": {
        "dataType": "refObject",
        "properties": {
            "cuisineType": {"dataType":"string","required":true},
            "priceRange": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "operatingHours": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "menuLink": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "cacNumber": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "licenseNumber": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FacilityDetailsDto": {
        "dataType": "refObject",
        "properties": {
            "facilityCategory": {"dataType":"string","required":true},
            "emergencyContact": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "operatingHours": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "cacNumber": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "licenseNumber": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateSubmissionDto": {
        "dataType": "refObject",
        "properties": {
            "listingType": {"ref":"ListingType","required":true},
            "title": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
            "category": {"ref":"CategoryEnum","required":true},
            "city": {"dataType":"string"},
            "neighborhood": {"dataType":"string","required":true},
            "address": {"dataType":"string"},
            "latitude": {"dataType":"double"},
            "longitude": {"dataType":"double"},
            "thumbnailUrl": {"dataType":"string","required":true},
            "galleryImageUrls": {"dataType":"array","array":{"dataType":"string"}},
            "legalDocumentUrls": {"dataType":"array","array":{"dataType":"string"}},
            "contactPhone": {"dataType":"string"},
            "contactEmail": {"dataType":"string"},
            "externalLink": {"dataType":"string"},
            "submitterName": {"dataType":"string","required":true},
            "submitterEmail": {"dataType":"string","required":true},
            "submitterPhone": {"dataType":"string","required":true},
            "eventDetails": {"ref":"EventDetailsDto"},
            "restaurantDetails": {"ref":"RestaurantDetailsDto"},
            "facilityDetails": {"ref":"FacilityDetailsDto"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ListingImageResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "imageUrl": {"dataType":"string","required":true},
            "sortOrder": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ListingStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["pending"]},{"dataType":"enum","enums":["needs_changes"]},{"dataType":"enum","enums":["approved"]},{"dataType":"enum","enums":["rejected"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ListingDetailResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "listingType": {"ref":"ListingType","required":true},
            "title": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
            "category": {"ref":"CategoryEnum","required":true},
            "categoryLabel": {"dataType":"string","required":true},
            "city": {"dataType":"string","required":true},
            "neighborhood": {"dataType":"string","required":true},
            "address": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "latitude": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
            "longitude": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
            "thumbnailUrl": {"dataType":"string","required":true},
            "images": {"dataType":"array","array":{"dataType":"refObject","ref":"ListingImageResponse"},"required":true},
            "legalDocumentUrls": {"dataType":"array","array":{"dataType":"string"}},
            "contactPhone": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "contactEmail": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "externalLink": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "status": {"ref":"ListingStatus","required":true},
            "isFeatured": {"dataType":"boolean","required":true},
            "featuredOrder": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
            "isPublished": {"dataType":"boolean","required":true},
            "eventDetails": {"dataType":"union","subSchemas":[{"ref":"EventDetailsDto"},{"dataType":"enum","enums":[null]}]},
            "restaurantDetails": {"dataType":"union","subSchemas":[{"ref":"RestaurantDetailsDto"},{"dataType":"enum","enums":[null]}]},
            "facilityDetails": {"dataType":"union","subSchemas":[{"ref":"FacilityDetailsDto"},{"dataType":"enum","enums":[null]}]},
            "createdAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"}],"required":true},
            "updatedAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_ListingDetailResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"ref":"ListingDetailResponse","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResubmitListingDto": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string"},
            "description": {"dataType":"string"},
            "category": {"ref":"CategoryEnum"},
            "city": {"dataType":"string"},
            "neighborhood": {"dataType":"string"},
            "address": {"dataType":"string"},
            "latitude": {"dataType":"double"},
            "longitude": {"dataType":"double"},
            "thumbnailUrl": {"dataType":"string"},
            "galleryImageUrls": {"dataType":"array","array":{"dataType":"string"}},
            "legalDocumentUrls": {"dataType":"array","array":{"dataType":"string"}},
            "contactPhone": {"dataType":"string"},
            "contactEmail": {"dataType":"string"},
            "externalLink": {"dataType":"string"},
            "submitterName": {"dataType":"string"},
            "submitterPhone": {"dataType":"string"},
            "eventDetails": {"ref":"EventDetailsDto"},
            "restaurantDetails": {"ref":"RestaurantDetailsDto"},
            "facilityDetails": {"ref":"FacilityDetailsDto"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UploadSignatureResponse": {
        "dataType": "refObject",
        "properties": {
            "signature": {"dataType":"string","required":true},
            "timestamp": {"dataType":"double","required":true},
            "apiKey": {"dataType":"string","required":true},
            "cloudName": {"dataType":"string","required":true},
            "folder": {"dataType":"string","required":true},
            "uploadUrl": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_UploadSignatureResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"ref":"UploadSignatureResponse","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MediaUploadType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["thumbnail"]},{"dataType":"enum","enums":["gallery"]},{"dataType":"enum","enums":["legal_doc"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginationMeta": {
        "dataType": "refObject",
        "properties": {
            "page": {"dataType":"double","required":true},
            "limit": {"dataType":"double","required":true},
            "total": {"dataType":"double","required":true},
            "totalPages": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedApiResponse_ListingDetailResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"ListingDetailResponse"},"required":true},
            "pagination": {"ref":"PaginationMeta","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CountdownSliderItem": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "listingType": {"dataType":"enum","enums":["event"],"required":true},
            "title": {"dataType":"string","required":true},
            "thumbnailUrl": {"dataType":"string","required":true},
            "city": {"dataType":"string","required":true},
            "neighborhood": {"dataType":"string","required":true},
            "category": {"ref":"CategoryEnum","required":true},
            "categoryLabel": {"dataType":"string","required":true},
            "isFeatured": {"dataType":"boolean","required":true},
            "featuredOrder": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
            "startDateTime": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"}],"required":true},
            "endDateTime": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_CountdownSliderItem-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"CountdownSliderItem"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CityResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "state": {"dataType":"string","required":true},
            "isActive": {"dataType":"boolean","required":true},
            "listingCount": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_CityResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"CityResponse"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CategoryResponse": {
        "dataType": "refObject",
        "properties": {
            "slug": {"ref":"CategoryEnum","required":true},
            "name": {"dataType":"string","required":true},
            "displayOrder": {"dataType":"double","required":true},
            "listingCount": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_CategoryResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"CategoryResponse"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ModerationActionResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "status": {"ref":"ListingStatus","required":true},
            "isPublished": {"dataType":"boolean","required":true},
            "rejectionReason": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "adminNotes": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "updatedAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_ModerationActionResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"ref":"ModerationActionResponse","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RejectListingDto": {
        "dataType": "refObject",
        "properties": {
            "rejectionReason": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RequestChangesDto": {
        "dataType": "refObject",
        "properties": {
            "adminNotes": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginResponse": {
        "dataType": "refObject",
        "properties": {
            "token": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_LoginResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"ref":"LoginResponse","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginDto": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AdminRole": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["admin"]},{"dataType":"enum","enums":["super_admin"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AdminUserResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "role": {"ref":"AdminRole","required":true},
            "isActive": {"dataType":"boolean","required":true},
            "createdAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_AdminUserResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"ref":"AdminUserResponse","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AdminListingDetailResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "listingType": {"ref":"ListingType","required":true},
            "title": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
            "category": {"ref":"CategoryEnum","required":true},
            "categoryLabel": {"dataType":"string","required":true},
            "city": {"dataType":"string","required":true},
            "neighborhood": {"dataType":"string","required":true},
            "address": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "latitude": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
            "longitude": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
            "thumbnailUrl": {"dataType":"string","required":true},
            "images": {"dataType":"array","array":{"dataType":"refObject","ref":"ListingImageResponse"},"required":true},
            "legalDocumentUrls": {"dataType":"array","array":{"dataType":"string"}},
            "contactPhone": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "contactEmail": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "externalLink": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "submitterName": {"dataType":"string","required":true},
            "submitterEmail": {"dataType":"string","required":true},
            "submitterPhone": {"dataType":"string","required":true},
            "editToken": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "status": {"ref":"ListingStatus","required":true},
            "rejectionReason": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "adminNotes": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "isFeatured": {"dataType":"boolean","required":true},
            "featuredOrder": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
            "isPublished": {"dataType":"boolean","required":true},
            "eventDetails": {"dataType":"union","subSchemas":[{"ref":"EventDetailsDto"},{"dataType":"enum","enums":[null]}]},
            "restaurantDetails": {"dataType":"union","subSchemas":[{"ref":"RestaurantDetailsDto"},{"dataType":"enum","enums":[null]}]},
            "facilityDetails": {"dataType":"union","subSchemas":[{"ref":"FacilityDetailsDto"},{"dataType":"enum","enums":[null]}]},
            "createdAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"}],"required":true},
            "updatedAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"datetime"}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedApiResponse_AdminListingDetailResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"AdminListingDetailResponse"},"required":true},
            "pagination": {"ref":"PaginationMeta","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_null_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"enum","enums":[null],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ReorderFeaturedDto": {
        "dataType": "refObject",
        "properties": {
            "orderedIds": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_AdminListingDetailResponse_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"ref":"AdminListingDetailResponse","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FeatureListingDto": {
        "dataType": "refObject",
        "properties": {
            "isFeatured": {"dataType":"boolean","required":true},
            "featuredOrder": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PublishStatusDto": {
        "dataType": "refObject",
        "properties": {
            "isPublished": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsSubmissionsController_createSubmission: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateSubmissionDto"},
        };
        app.post('/api/v1/submissions',
            ...(fetchMiddlewares<RequestHandler>(SubmissionsController)),
            ...(fetchMiddlewares<RequestHandler>(SubmissionsController.prototype.createSubmission)),

            async function SubmissionsController_createSubmission(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSubmissionsController_createSubmission, request, response });

                const controller = new SubmissionsController();

              await templateService.apiHandler({
                methodName: 'createSubmission',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSubmissionsController_getSubmissionForEdit: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                editToken: {"in":"query","name":"editToken","required":true,"dataType":"string"},
        };
        app.get('/api/v1/submissions/:id',
            ...(fetchMiddlewares<RequestHandler>(SubmissionsController)),
            ...(fetchMiddlewares<RequestHandler>(SubmissionsController.prototype.getSubmissionForEdit)),

            async function SubmissionsController_getSubmissionForEdit(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSubmissionsController_getSubmissionForEdit, request, response });

                const controller = new SubmissionsController();

              await templateService.apiHandler({
                methodName: 'getSubmissionForEdit',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSubmissionsController_updateAndResubmit: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                editToken: {"in":"query","name":"editToken","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"ResubmitListingDto"},
        };
        app.put('/api/v1/submissions/:id',
            ...(fetchMiddlewares<RequestHandler>(SubmissionsController)),
            ...(fetchMiddlewares<RequestHandler>(SubmissionsController.prototype.updateAndResubmit)),

            async function SubmissionsController_updateAndResubmit(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSubmissionsController_updateAndResubmit, request, response });

                const controller = new SubmissionsController();

              await templateService.apiHandler({
                methodName: 'updateAndResubmit',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMediaController_getUploadSignature: Record<string, TsoaRoute.ParameterSchema> = {
                type: {"default":"thumbnail","in":"query","name":"type","ref":"MediaUploadType"},
        };
        app.get('/api/v1/media/upload-signature',
            ...(fetchMiddlewares<RequestHandler>(MediaController)),
            ...(fetchMiddlewares<RequestHandler>(MediaController.prototype.getUploadSignature)),

            async function MediaController_getUploadSignature(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMediaController_getUploadSignature, request, response });

                const controller = new MediaController();

              await templateService.apiHandler({
                methodName: 'getUploadSignature',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsListingsController_getListings: Record<string, TsoaRoute.ParameterSchema> = {
                category: {"in":"query","name":"category","ref":"CategoryEnum"},
                city: {"in":"query","name":"city","dataType":"string"},
                neighborhood: {"in":"query","name":"neighborhood","dataType":"string"},
                type: {"in":"query","name":"type","ref":"ListingType"},
                date: {"in":"query","name":"date","dataType":"string"},
                startDate: {"in":"query","name":"startDate","dataType":"string"},
                endDate: {"in":"query","name":"endDate","dataType":"string"},
                search: {"in":"query","name":"search","dataType":"string"},
                page: {"in":"query","name":"page","dataType":"double"},
                limit: {"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/api/v1/listings',
            ...(fetchMiddlewares<RequestHandler>(ListingsController)),
            ...(fetchMiddlewares<RequestHandler>(ListingsController.prototype.getListings)),

            async function ListingsController_getListings(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsListingsController_getListings, request, response });

                const controller = new ListingsController();

              await templateService.apiHandler({
                methodName: 'getListings',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsListingsController_getUpcomingCountdown: Record<string, TsoaRoute.ParameterSchema> = {
                limit: {"in":"query","name":"limit","dataType":"double"},
                city: {"in":"query","name":"city","dataType":"string"},
        };
        app.get('/api/v1/listings/upcoming-countdown',
            ...(fetchMiddlewares<RequestHandler>(ListingsController)),
            ...(fetchMiddlewares<RequestHandler>(ListingsController.prototype.getUpcomingCountdown)),

            async function ListingsController_getUpcomingCountdown(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsListingsController_getUpcomingCountdown, request, response });

                const controller = new ListingsController();

              await templateService.apiHandler({
                methodName: 'getUpcomingCountdown',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsListingsController_getListingById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/api/v1/listings/:id',
            ...(fetchMiddlewares<RequestHandler>(ListingsController)),
            ...(fetchMiddlewares<RequestHandler>(ListingsController.prototype.getListingById)),

            async function ListingsController_getListingById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsListingsController_getListingById, request, response });

                const controller = new ListingsController();

              await templateService.apiHandler({
                methodName: 'getListingById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCitiesController_getCities: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/v1/cities',
            ...(fetchMiddlewares<RequestHandler>(CitiesController)),
            ...(fetchMiddlewares<RequestHandler>(CitiesController.prototype.getCities)),

            async function CitiesController_getCities(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCitiesController_getCities, request, response });

                const controller = new CitiesController();

              await templateService.apiHandler({
                methodName: 'getCities',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoriesController_getCategories: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/v1/categories',
            ...(fetchMiddlewares<RequestHandler>(CategoriesController)),
            ...(fetchMiddlewares<RequestHandler>(CategoriesController.prototype.getCategories)),

            async function CategoriesController_getCategories(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoriesController_getCategories, request, response });

                const controller = new CategoriesController();

              await templateService.apiHandler({
                methodName: 'getCategories',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminModerationController_approveListing: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.put('/api/v1/admin/listings/:id/approve',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminModerationController)),
            ...(fetchMiddlewares<RequestHandler>(AdminModerationController.prototype.approveListing)),

            async function AdminModerationController_approveListing(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminModerationController_approveListing, request, response });

                const controller = new AdminModerationController();

              await templateService.apiHandler({
                methodName: 'approveListing',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminModerationController_rejectListing: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"RejectListingDto"},
        };
        app.put('/api/v1/admin/listings/:id/reject',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminModerationController)),
            ...(fetchMiddlewares<RequestHandler>(AdminModerationController.prototype.rejectListing)),

            async function AdminModerationController_rejectListing(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminModerationController_rejectListing, request, response });

                const controller = new AdminModerationController();

              await templateService.apiHandler({
                methodName: 'rejectListing',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminModerationController_requestChanges: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"RequestChangesDto"},
        };
        app.put('/api/v1/admin/listings/:id/request-changes',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminModerationController)),
            ...(fetchMiddlewares<RequestHandler>(AdminModerationController.prototype.requestChanges)),

            async function AdminModerationController_requestChanges(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminModerationController_requestChanges, request, response });

                const controller = new AdminModerationController();

              await templateService.apiHandler({
                methodName: 'requestChanges',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminAuthController_login: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"LoginDto"},
        };
        app.post('/api/v1/admin/auth/login',
            ...(fetchMiddlewares<RequestHandler>(AdminAuthController)),
            ...(fetchMiddlewares<RequestHandler>(AdminAuthController.prototype.login)),

            async function AdminAuthController_login(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminAuthController_login, request, response });

                const controller = new AdminAuthController();

              await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminAuthController_getProfile: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/v1/admin/auth/me',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminAuthController)),
            ...(fetchMiddlewares<RequestHandler>(AdminAuthController.prototype.getProfile)),

            async function AdminAuthController_getProfile(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminAuthController_getProfile, request, response });

                const controller = new AdminAuthController();

              await templateService.apiHandler({
                methodName: 'getProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminListingsController_getAdminListings: Record<string, TsoaRoute.ParameterSchema> = {
                status: {"in":"query","name":"status","ref":"ListingStatus"},
                type: {"in":"query","name":"type","ref":"ListingType"},
                city: {"in":"query","name":"city","dataType":"string"},
                search: {"in":"query","name":"search","dataType":"string"},
                page: {"in":"query","name":"page","dataType":"double"},
                limit: {"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/api/v1/admin/listings',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminListingsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminListingsController.prototype.getAdminListings)),

            async function AdminListingsController_getAdminListings(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminListingsController_getAdminListings, request, response });

                const controller = new AdminListingsController();

              await templateService.apiHandler({
                methodName: 'getAdminListings',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminListingsController_reorderFeatured: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"ReorderFeaturedDto"},
        };
        app.put('/api/v1/admin/listings/reorder-featured',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminListingsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminListingsController.prototype.reorderFeatured)),

            async function AdminListingsController_reorderFeatured(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminListingsController_reorderFeatured, request, response });

                const controller = new AdminListingsController();

              await templateService.apiHandler({
                methodName: 'reorderFeatured',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminListingsController_getAdminListingById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/api/v1/admin/listings/:id',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminListingsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminListingsController.prototype.getAdminListingById)),

            async function AdminListingsController_getAdminListingById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminListingsController_getAdminListingById, request, response });

                const controller = new AdminListingsController();

              await templateService.apiHandler({
                methodName: 'getAdminListingById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminListingsController_featureListing: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"FeatureListingDto"},
        };
        app.put('/api/v1/admin/listings/:id/feature',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminListingsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminListingsController.prototype.featureListing)),

            async function AdminListingsController_featureListing(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminListingsController_featureListing, request, response });

                const controller = new AdminListingsController();

              await templateService.apiHandler({
                methodName: 'featureListing',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminListingsController_setPublishStatus: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"PublishStatusDto"},
        };
        app.put('/api/v1/admin/listings/:id/publish-status',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminListingsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminListingsController.prototype.setPublishStatus)),

            async function AdminListingsController_setPublishStatus(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminListingsController_setPublishStatus, request, response });

                const controller = new AdminListingsController();

              await templateService.apiHandler({
                methodName: 'setPublishStatus',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            try {
                request['user'] = await Promise.any(secMethodOrPromises);

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }

                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
