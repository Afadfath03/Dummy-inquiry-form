'use strict';

// Dashboard: list every configured case as a link into its /{case}/ folder.

(function () {
  var CASES = window.CASES || {};
  var list = document.getElementById('case-list');
  var ids = Object.keys(CASES);

  if (!ids.length) {
    var empty = document.createElement('p');
    empty.textContent = 'No cases configured yet.';
    list.appendChild(empty);
    return;
  }

  ids.forEach(function (id) {
    var config = CASES[id];

    var card = document.createElement('a');
    card.className = 'case-card';
    card.href = './' + encodeURIComponent(id) + '/';

    var title = document.createElement('h2');
    title.className = 'case-card-title';
    title.textContent = config.title || id;

    var description = document.createElement('p');
    description.className = 'case-card-desc';
    description.textContent = config.description || '';

    card.appendChild(title);
    card.appendChild(description);
    list.appendChild(card);
  });
})();
