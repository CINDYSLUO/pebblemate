/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var LOCU_APIKEY = '7b2e9fe9272fb4d8b36b3399dc7c721050ecc9ba'; 
var ajax = require('ajax');
var current_location = {};
var LIMIT = 5;
var order = [];

var main = new UI.Menu({
   sections: [{
     title: "Choose Cuisine",
     items: [{
        title: 'Italian',
       subtitle: ''
        
      }, {
        title: 'Japanese',
        subtitle: 'sushi galore and more'
        
      }, {
        title: 'American',
        subtitle: ''
      }, {
        title: 'Chinese',
        subtitle: ''
       }, {
        title: 'Mexican',
         subtitle: 'from chili con carne to enchiladas'
       
      }]
    }]
  });


  main.on ('select', function(e) {
    console.log ('You picked "' + e.item.title + '"');
    var cuisine = e.item.title;
    
    ajax(
      {
        url: 'https://api.locu.com/v2/venue/search',
        method: 'POST',
        type: 'json',
        data: {
          api_key: LOCU_APIKEY,
          fields: ["name", 'menus', 'location', 'open_hours'],
          venue_queries: [
            {
              categories: {
                'name': cuisine
              },
              location : {
                geo : {
                  '$in_lat_lng_radius' : [current_location.lat, current_location.lon, 5000]
                }
              },
              menus: { '$present' : true } 
            }
          ]
        },
      }, function(result, status, request) {
          console.log(result.venues[0].menus[0].menu_name);
            var restaurant_list = new UI.Menu({
              sections: [{
                items: [
              ]
            }]
          });
          for (var i=0; i<LIMIT;i++){
           if (result.venues[i]!==undefined){
             restaurant_list.items(i, [{title: result.venues[i].name}]);
           }
          }
          restaurant_list.show();      
        
          restaurant_list.on('select', function (e) {
            var restaurant_picked = result.venues[e.itemIndex];
            var restaurant_menu = new UI.Menu({
              sections: [{
                items: [
                  
                ]
              }]
            });
            
            for (var i=0; i<restaurant_picked.menus.length; i++){
              restaurant_menu.items(i, [{title: restaurant_picked.menus[i].menu_name}]);
            }
            
            restaurant_menu.show();
            console.log("restaurant menus");
            
            restaurant_menu.on('select', function (e) {
              console.log("you want to see the " + e.item.title + "menu");
              console.log(e);
              console.log(restaurant_picked.menus[e.itemIndex].menu_name);
              var menu_picked = restaurant_picked.menus[e.itemIndex].sections[0].subsections[0];
              
              var menu_items = new UI.Menu ({
                sections: [{
                  items: [
                  
                  ] 
                }]
              });
              
              for (var i=1; i<menu_picked.contents.length;i++){
                menu_items.items(i, [{
                  title: menu_picked.contents[i].name,
                  subtitle: "$" + menu_picked.contents[i].price
                }]);
              }
              menu_items.show(); 
      
              
            });
            
          }); 
      }, function(error, status, request) {
          console.log(error.error);
      }
    );  
});

main.show();

var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 10000
};

function locationSuccess(pos) {
  console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
  //console.log(pos.coords.latitude); 
  current_location.lat = pos.coords.latitude;
  current_location.lon = pos.coords.longitude;
  
}

function locationError(err) {
  console.log('location error (' + err.code + '): ' + err.message);
}

Pebble.addEventListener('ready',
  function(e) {
    // Request current position
    console.log(navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions));
  }
);