'use strict';

angular.module('facetedviz')
  .directive('fieldListItem', function(Dataset, Fields, Tether) {
    return {
      templateUrl: 'components/fieldlistitem/fieldlistitem.html',
      restrict: 'E',
      replace: true,
      scope: {
        field: '='
      },
      link: function postLink (scope, element /*, attrs*/) {

        var funcsPopup;

        scope.typeNames = Dataset.typeNames;
        scope.Fields = Fields;

        scope.toggleFuncsExpand = function() {
          scope.funcsExpanded = !scope.funcsExpanded;
          if (scope.funcsExpanded) {
            if (funcsPopup) {
              funcsPopup.enable();
            } else {
              funcsPopup = new Tether({
                element: element.find('.popup-functions'),
                target: element.find('label'),
                attachment: 'top left',
                targetAttachment: 'bottom left'
              });
            }
          } else {
            if (funcsPopup) {
              funcsPopup.destroy();
            }
          }
        };
      }
    };
  });
