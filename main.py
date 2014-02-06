#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import jinja2
import os
import time

from models import MovieQuote


jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class MainHandler(webapp2.RequestHandler):
    def get(self):
        moviequotes = MovieQuote.query().order(-MovieQuote.last_touch_date_time).fetch(30)
        template = jinja_env.get_template('templates/moviequotes.html')
        self.response.out.write(template.render({'moviequotes': moviequotes}))

    def post(self):
        new_quote = MovieQuote(movie_title = self.request.get('movie_title'), quote = self.request.get('quote'))
        new_quote.put()
        time.sleep(0.25)
        self.redirect('/')

app = webapp2.WSGIApplication([
    ('/', MainHandler)
], debug=True)
