require 'rubygems'
require 'json'
require "lib/mapquest/mapquest_service"
require "lib/open_maps/open_maps_service"

class ItineraryController < ApplicationController
  protect_from_forgery
  before_filter
  
  def initialize 
    @mapquest_service = MapquestService.new
    @open_mapquest_service = OpenMapsService.new
  end
  
  def index    
    render :layout => 'itinerary'
  end
     
  def getpoints
    @latLngs = params[:query].split(/;/)
    @locationsArray = Array.new
    @latLngs.each { |x| @locationsArray << {:lat => x.split(/,/)[0], :lng => x.split(/,/)[0]} }
    puts @locationsArray
    render :json => @locationsArray
  end
  
end