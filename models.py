# Put our model objects here
# Model objects get stored and due to proto datastore
#   they messages as well (for free)

from google.appengine.ext import ndb
from endpoints_proto_datastore.ndb import EndpointsModel

class MovieQuote(EndpointsModel):
    """ Model object (and message) for a movie quote. """
    _message_fields_schema = ('id', 'movie_title', 'quote', 'last_touch_date_time')
    movie_title = ndb.StringProperty()
    quote = ndb.StringProperty()
    last_touch_date_time = ndb.DateTimeProperty(auto_now=True)
    