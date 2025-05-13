import EventEmitter from 'eventemitter3';

export const eventBus = new EventEmitter();

export const EVENT_KEYS = {
  EMBEDDED_PRODUCT_UPDATED: 'EMBEDDED_PRODUCT_UPDATED',
};
