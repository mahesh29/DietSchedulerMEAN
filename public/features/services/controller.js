var app = angular.module('abc', ['ui.bootstrap', 'dialogs', 'ngSanitize', 'ngRoute']);

app.controller('ServiceController', function($scope, $http, $filter, $window, $rootScope, $timeout, $dialogs, $route) {
    // To facilitate 'Math' operations in the View side.
    //$scope.calInputNumber = null;
    $scope.Math = window.Math;


    $("#entryDeletionCal").hide("slow");


    function makeCalendar(input) {
        $("#my-calendar").zabuto_calendar({
            data: input,
            modal: true,
            action: function(input) {
                getInfoFromDatabase(this.id, this, input);
            }
        });
    }

    function getInfoFromDatabase(id, something, others) {

        var date = $("#" + id).data("date");
        var hasEvent = $("#" + id).data("hasEvent");
        
        $scope.deleteByDate = "Delete the agenda for "+date+" !";

        $http.get("/existsInDatabase/" + date)
            .success(function(response) 
            {
            	

                var dietArrFromResponse = response.dietPlan;
                var totCalsFromResponse = response.totalCals;
                
                var result="<table class='able table-striped table-condensed table-hover table-responsive'>"
                				+"<thead><tr>"
                				+"<td>Item Name</td><td>Type</td><td>Calories</td>"
                				+"</thead><tbody>";
                if(totCalsFromResponse != undefined)
                {
                	$("#entryDeletionCal").show("slow");
	                for (var key in dietArrFromResponse)
					{
					   if (dietArrFromResponse.hasOwnProperty(key))
					   {
					      // here you have access to
					      var itemName = dietArrFromResponse[key].name;
					      var itemType = dietArrFromResponse[key].type;
					      var itemCals = dietArrFromResponse[key].cals;
					      result = result + "<tr>" 
					      			+ "<td>" + itemName + "</td>"
					      			+ "<td>" + itemType + "</td>"
					      			+ "<td>" + itemCals + "</td></tr>";
					   }
					}
				
				result = result + "</tbody></table><br/><br/>"
								+"Total Calories:<b>"+totCalsFromResponse+"</b><br/> ";
				}
				if (totCalsFromResponse == undefined) result = "No Data for this date !";

				$dialogs.notify('DIET PLAN' + date, result);
                // console.log(dateFromResponse);
                //console.log($scope.bItems.length);
                // console.log(dateFromResponse);
                
            });



        // console.log(others);
        // $dialogs.notify('Diet Plan for ' + date, 'Any Plan for today ?: ' + hasEvent);

    }



    //---------------------------------------
    // API CALLS
    //---------------------------------------

    // Client call for Brand Names
    $scope.getBrand = function(bName) {
        $http.get("/apiSearchBrand/" + bName)
            .success(function(response) {
                var arrHits = response.hits;
                $scope.apiBrandResponses = arrHits;
                //console.log(response.hits);
            });
    };
    $scope.bItems = [];
    // Client Call for Calories
    $scope.getCalorieSeparateRatio = function(cals) {
        // Divide the input calories into a ratio 4:3:2
        // And call the api for calories with these three numbers.

        var calNum = Number(cals);

        $http.get("/apiSearchForCalories/" + (Math.round(calNum / 3)).toString())
            .success(function(response) {
                var arrHits = response.hits;
                $scope.bItems = arrHits;
                $scope.numberOfPages = Math.ceil($scope.bItems.length / $scope.pageSize);
                //console.log($scope.bItems.length);
            });


        $http.get("/apiSearchForCalories/" + (Math.round(calNum / 4)).toString())
            .success(function(response) {
                var arrHits = response.hits;
                $scope.lItems = arrHits;
                //console.log(response.hits);
            });

        $http.get("/apiSearchForCalories/" + (Math.round(calNum / 6)).toString())
            .success(function(response) {
                var arrHits = response.hits;
                $scope.dItems = arrHits;
            });
    };



    //$scope.bItems= [];
    $scope.currentPage = 0;
    $scope.pageSize = 5;
    //$scope.data = [];
    $scope.numberOfPages = Math.ceil($scope.bItems.length / $scope.pageSize);

    $scope.checkout = [];
    var sum = 0;
    $scope.addToCheckoutList = function(itmName, itmGroup) {
        var isExisting = false;
        // sum = 0;

        angular.forEach($scope.checkout, function(item) {


            if (itmName.fields.item_name == item.name && itmGroup == item.type) {
                isExisting = true;
                $window.alert('You have already selected this item !');
            }
        });

        if (isExisting == false) {
            //increment the total sum of calories
            sum = sum + itmName.fields.nf_calories;
            $scope.totNumOfCals = sum;
            // Check if the total calories exceed the inputted calories
            $scope.boolCalorieCondition = ($scope.totNumOfCals <= $scope.calInputNumber);
            $scope.dialogMessage = ($scope.boolCalorieCondition) ? "Save" : "Total Calories greater than entered value !";
            // push the object in the list
            $scope.checkout.push({
                name: itmName.fields.item_name,
                type: itmGroup,
                cals: itmName.fields.nf_calories
            });
            $scope.message = 'You have successfully added this item to the list !';
        }

    };

    $scope.dropDown = function() {
        $("#modal-to-open").dialog("open");
    }

    $scope.addToDatabase = function(aCheckoutList, aDate) {

        if ($scope.dateModel == undefined) {
            $window.confirm('Please Enter The Date');
        } else if ($scope.dateModel.length == 0) {
            $window.confirm('Please Enter The Date');
        } else {

            var isDatePresent;
            var boolOverwrite;
            // dateFromCallback is assigned in the "$scope.checkDateExists" function 
            $scope.checkDateExists(aDate, function(dateFromCallback) {
                // console.log(aDate == dateFromCallback);
                isDatePresent = (aDate == dateFromCallback);

                if (isDatePresent) {
                    boolOverwrite = $window.confirm('Value Exists for this Date, do you want to Overwrite it ?');

                    if (boolOverwrite) {

                        $http.delete("/deleteUsingDate/" + aDate);

                        var entry = {
                            user: "admin",
                            date: aDate,
                            dietPlan: $scope.checkout,
                            totalCals: $scope.totNumOfCals
                        };
                        //console.log(entry);
                        $http.post("/addItemsToDatabase", entry)
                            .success(function(response) {
                            	$scope.all();
                            });
                            location.reload();
                    }
                } else {
                    // $http.delete("/deleteUsingDate/" + aDate);

                    var entry = {
                        user: "admin",
                        date: aDate,
                        dietPlan: $scope.checkout,
                        totalCals: $scope.totNumOfCals
                    };
                    //console.log(entry);
                    $http.post("/addItemsToDatabase", entry)
                        .success(function(response) {
                        	$scope.all();
                        });
                        location.reload();
                }

            });
        }
    };

    $scope.deleteDiet = function(aDate) {

    	$scope.checkDateExists(aDate, function(dateFromCallback){

    		var isDatePresent = (aDate == dateFromCallback);
    		if (isDatePresent)
    		{
    			$http.delete("/deleteUsingDate/" + aDate);
    		    $("#entryDeletionCal").hide("slow");
    		}
    		$scope.deleteByDate = "Deleted Agenda for : "+aDate+" !";
    	});
    	//$route.reload();
    	location.reload();

    	// showCalendar();
		// $("#second").load(location.href + "#second");

    };

   $scope.stall = function () {

   		$("#my-calendar").zabuto_calendar({
            ajax: {url: "/allFromDatabase",
                        modal: true},
            action: function(input) {
                getInfoFromDatabase(this.id, this, input);
            }
        });
   };

   $scope.stall();


    $scope.removeItem = function(anIndexOfItem, anItem) {
        var delValue = 0;
        var isConfirmed = $window.confirm('Are you absolutely sure you want to delete it ?');
        if (isConfirmed) {
            delValue = anItem.cals;
            $scope.checkout.splice(anIndexOfItem, 1);
        }
        sum = sum - delValue;
        if (sum < 0) 
        {
            sum = 0;
        }
        $scope.totNumOfCals = sum;

        $scope.boolCalorieCondition = ($scope.totNumOfCals <= $scope.calInputNumber);
        $scope.dialogMessage = ($scope.boolCalorieCondition) ? "Save" : "Total Calories greater than entered value !";
    };

    $scope.checkDateExists = function(date, callback) {

        var dateFromDbase;

        $http.get("/existsInDatabase/" + date)
            .success(function(response) {
                var dateFromResponse = response.date;
                dateFromDbase = dateFromResponse;
                // console.log(dateFromResponse);
                //console.log($scope.bItems.length);
                // console.log(dateFromResponse);
                callback(dateFromResponse);
            });

    };



        $scope.calInputData;
    $scope.evntData = function(response) {
        $scope.calInputData = response;
        // console.log($scope.calInputData);
        makeCalendar($scope.calInputData);

    };
    //$scope.evntData;

    // var dataForCalendar = $scope.calInputData;

    //  $(document).ready(function () {
    // 	makeCalendar();
    // });

    // function loadCalendarWithData (){
$scope.all = function()
			{
			    $http.get("/allFromDatabase")
			        .success($scope.evntData);
    		}

    		$scope.all();

    		// console.log( $scope.calInputData);

    //makeCalendar();
    // }

    //loadCalendarWithData();

    // TEST MODAL ANGULAR-UI 
    // ----------------------
    // $scope.showModal = false;
    //  $scope.toggleModal = function(){
    //      $scope.showModal = !$scope.showModal;
    //  };
});

app.filter('startFrom', function() {
    return function(input, start) {
        if (!input || !input.length) {
            return;
        }
        start = +start; //parse to int
        return input.slice(start);
    }
});

// TEST MODAL ANGULAR-UI 
// ----------------------
// app.directive('modal', function () {
//     return {
//       template: '<div class="modal fade">' + 
//           '<div class="modal-dialog">' + 
//             '<div class="modal-content">' + 
//               '<div class="modal-header">' + 
//                 '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
//                 '<h4 class="modal-title">{{ title }}</h4>' + 
//               '</div>' + 
//               '<div class="modal-body" ng-transclude></div>' + 
//             '</div>' + 
//           '</div>' + 
//         '</div>',
//       restrict: 'E',
//       transclude: true,
//       replace:true,
//       scope:true,
//       link: function postLink(scope, element, attrs) {
//         scope.title = attrs.title;

//         scope.$watch(attrs.visible, function(value){
//           if(value == true)
//             $(element).modal('show');
//           else
//             $(element).modal('hide');
//         });

//         $(element).on('shown.bs.modal', function(){
//           scope.$apply(function(){
//             scope.$parent[attrs.visible] = true;
//           });
//         });

//         $(element).on('hidden.bs.modal', function(){
//           scope.$apply(function(){
//             scope.$parent[attrs.visible] = false;
//           });
//         });
//       }
//     };
//   });

app.run(['$templateCache', function($templateCache) {

    $templateCache.put('/dialogs/notify.html', '<div class="modal-header dialog-header-notify"><button type="button" class="close" ng-click="close()" class="pull-right">&times;</button><h4 class="modal-title text-info"><span class="glyphicon glyphicon-info-sign"></span> {{header}}</h4></div><div class="modal-body text-info" ng-bind-html="msg"></div><div class="modal-footer"><button type="button" class="btn btn-primary" ng-click="close()">OK</button></div>');


}]);