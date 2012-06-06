require "net/http"
require "uri"
require "cgi"

class MapquestService
  
  def initialize
    
  end
  
  def search(query)    
    uri = URI.parse(searchUrl(query))    
    getRequest(uri)
  end
  
  def getRequest(uri)
    http = Net::HTTP.new(uri.host, uri.port)
    open_maps_request = Net::HTTP::Get.new(uri.request_uri)
    open_maps_response = http.request(open_maps_request)
        
    puts open_maps_response.body.to_str #DEBUG
    
    open_maps_response
  end
  
  def searchUrl(query)
    "http://www.mapquestapi.com/geocoding/v1/address?key=#{APP_CONFIG["mapquest_api_key"]}&outFormat=json&thumbMaps=false&location=" + query
  end
  
  def directionsUrl(locations)
    "http://www.mapquestapi.com/directions/v1/route?key=#{APP_CONFIG["mapquest_api_key"]}&callback=renderAdvancedNarrative&ambiguities=ignore&avoidTimedConditions=false&doReverseGeocode=true&outFormat=json&routeType=fastest&timeType=1&enhancedNarrative=false&shapeFormat=raw&generalize=0&locale=en_US&unit=m&locations=" + locations
  end

end