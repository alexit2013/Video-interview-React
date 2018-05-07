import React from 'react';
import ReactDOM from 'react-dom';
import App from './pages/router';
import registerServiceWorker from './registerServiceWorker';

const polyfill = (() => {
  // Object.entries
  if (!Object.entries)
  Object.entries = function( obj ){
    var ownProps = Object.keys( obj ),
        i = ownProps.length,
        resArray = new Array(i); // preallocate the Array
    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    
    return resArray;
  }
})();

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
