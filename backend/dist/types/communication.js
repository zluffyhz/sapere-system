"use strict";
// Tipos para o módulo de comunicação do Sistema Sapere
// Inspirado no iClinic com integração WhatsApp Business API
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageTemplate = exports.CommunicationStatus = exports.CommunicationType = void 0;
var CommunicationType;
(function (CommunicationType) {
    CommunicationType["WHATSAPP"] = "whatsapp";
    CommunicationType["EMAIL"] = "email";
    CommunicationType["SMS"] = "sms";
    CommunicationType["CALL"] = "call";
})(CommunicationType || (exports.CommunicationType = CommunicationType = {}));
var CommunicationStatus;
(function (CommunicationStatus) {
    CommunicationStatus["PENDING"] = "pending";
    CommunicationStatus["SENDING"] = "sending";
    CommunicationStatus["SENT"] = "sent";
    CommunicationStatus["DELIVERED"] = "delivered";
    CommunicationStatus["READ"] = "read";
    CommunicationStatus["FAILED"] = "failed";
    CommunicationStatus["CANCELLED"] = "cancelled";
})(CommunicationStatus || (exports.CommunicationStatus = CommunicationStatus = {}));
var MessageTemplate;
(function (MessageTemplate) {
    MessageTemplate["APPOINTMENT_CONFIRMATION"] = "appointment_confirmation";
    MessageTemplate["APPOINTMENT_REMINDER_24H"] = "appointment_reminder_24h";
    MessageTemplate["APPOINTMENT_REMINDER_2H"] = "appointment_reminder_2h";
    MessageTemplate["APPOINTMENT_CANCELLED"] = "appointment_cancelled";
    MessageTemplate["APPOINTMENT_RESCHEDULED"] = "appointment_rescheduled";
    MessageTemplate["WELCOME_MESSAGE"] = "welcome_message";
    MessageTemplate["THERAPY_REPORT"] = "therapy_report";
    MessageTemplate["NEWSLETTER"] = "newsletter";
    MessageTemplate["BIRTHDAY_WISH"] = "birthday_wish";
    MessageTemplate["FOLLOW_UP"] = "follow_up";
    MessageTemplate["CUSTOM"] = "custom";
})(MessageTemplate || (exports.MessageTemplate = MessageTemplate = {}));
//# sourceMappingURL=communication.js.map