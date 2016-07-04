'use strict';

/**
 * @ngdoc service
 * @name polestar.Pills
 * @description
 * # Pills
 * Service in the polestar.
 */
angular.module('polestar')
  .service('Pills', function () {
    var Pills = {
      // Functions
      get: get,
      set: set,
      // Event
      dragStart: dragStart,
      dragStop: dragStop,
      // Event, with handler in the listener
      update: update,
      remove: remove,
      dragDrop: dragDrop,

      // Data
      // TODO: split between encoding related and non-encoding related
      pills: {},
      /** pill being dragged */
      dragging: null,
      /** channelId that's the pill is being dragged from */
      cidDragFrom: null,
      /** Listener  */
      listener: null
    };

    /**
     * Set a fieldDef of a pill of a given channelId
     */
    function set(channelId, fieldDef) {
      Pills.pills[channelId] = fieldDef;
    }

    /**
     * Get a fieldDef of a pill of a given channelId
     */
    function get(channelId) {
      return Pills.pills[channelId];
    }

    function remove(channelId) {
      delete Pills.pills[channelId];
      if (Pills.listener) {
        Pills.listener.remove(channelId);
      }
    }

    /** Updating the pill (e.g., via function select) */
    function update(channelId) {
      if (Pills.listener) {
        Pills.listener.update(channelId, Pills.pills[channelId]);
      }
    };

    /**
     * @param {any} pill pill being dragged
     * @param {any} cidDragFrom channel id that the pill is dragged from
     */
    function dragStart(pill, cidDragFrom) {
      Pills.dragging = pill;
      Pills.cidDragFrom = cidDragFrom;
    };

    /** Stop pill dragging */
    function dragStop() {
      Pills.dragging = null;
    };

    /**
     * When a pill is dropped
     * @param cidDragTo  channelId that's the pill is being dragged to
     */
    function dragDrop(cidDragTo) {
      if (Pills.listener) {
        Pills.listener.dragDrop(cidDragTo, Pills.cidDragFrom)
      }
    };

    return Pills;
  });
