var eventsInline;
		var modalObj;
		$(document).ready(function() {
			     $('#modal-to-open').dialog({
			     	position: 'relative',
			        autoOpen: false,
			        top: 10,
			        width: 'auto',
			        maxWidth: 700,
			        minHeight: 300,
			        maxHeight: 500,
			        //display: 'inline-block',
			        //height: '100%',
				    modal: true,
				    fluid: true, //new option
				    resizable: false,
				    overflow: 'scroll'
				    //overflow: true
				}); 
			     $("#tableDiv").hide();
			     $("#about").show();
				 $("#second").hide();
				 $("#first").hide();
		}); 
		
		$(function() {
		    $( "#datepicker" ).datepicker({ dateFormat: 'yy-mm-dd' });
		});

		function showTables()
		{
			$("#tableDiv").show();
		}

		function showDashboard()
		{
			$("#about").hide();
			$("#second").hide();
			$("#first").show();
		}

		function showCalendar()
		{
			$("#about").hide();
			$("#first").hide();
			$("#second").show();
		}

		function showAbout()
		{
			$("#second").hide();
			$("#first").hide();
			$("#about").show();
		}


		$('#myTab a').click(function (e) {
		  e.preventDefault()
		  $(this).tab('show')
		});

    
				