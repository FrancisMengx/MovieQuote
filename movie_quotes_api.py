""" Movie quotes API"""

import endpoints
from protorpc import remote

from models import MovieQuote

@endpoints.api(name='moviequotes', version='v1', description='Movie Quotes API', hostname='fisherds-movie-quotes.appspot.com')
class MovieQuotesApi(remote.Service):
    """ Class which defines moviesquotes API"""
    
    @MovieQuote.method(path='quote/insert', http_method='POST', name='quote.insert')
    def quote_insert(self, a_quote):
        """ Insert a quote. """
        a_quote.put()
        return a_quote

    @MovieQuote.method(path='quote/insert_list', http_method='POST', name='quote.insert_list')
    def quote_insert_list(self, a_quote_list):
        """ Insert a list of quote. """
        for a_quote in a_quote_list:
            a_quote.put()
        return a_quote_list
    
    @MovieQuote.query_method(query_fields=('limit', 'order', 'pageToken'), path='quote/list', http_method='GET', name='quote.list')
    def quotes_list(self, query):
        """ Return a list of quotes. """
        return query
    
    @MovieQuote.method(request_fields=('id',), path='quote/delete/{id}', http_method='DELETE', name='quote.delete')
    def quote_delete(self, a_quote):
        """ Delete a quote. """
        if not a_quote.from_datastore:
            raise endpoints.NotFoundException("Quote not found.  Nothing deleted.")
        a_quote.key.delete()
        return MovieQuote(quote="deleted")

app = endpoints.api_server([MovieQuotesApi], restricted=False)    

    