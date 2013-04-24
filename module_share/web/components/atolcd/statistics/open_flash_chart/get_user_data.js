function getUserFlashData(param) {
  var params = YAHOO.lang.JSON.parse(unescape(param)),
    jsonChart = null;

  jsonChart = buildChart(params);

  return YAHOO.lang.JSON.stringify(jsonChart);
};

function buildTitle(params) {
  var title = "",
      site = params.additionalsParams.site,
      siteTitle = params.additionalsParams.siteTitle || '';

  if (site && site.indexOf(',') == -1) {
    var opt = '<i>"' + ((siteTitle != "") ? siteTitle : site) + '"</i>';
    title = getMessage("site", "graph.title.", opt);
  } else {
    title = getMessage("all", "graph.title.");
  }

  title += buildDateTitle(params);
  return title;
}

/**
 * @method buildBarChart
 * @param params JSON Parameters from query
 * @return JSON Bar Chart Data
 */

function buildChart(params) {
  params.max = 0;
  var x_labels = buildXAxisLabels(params);
  var bars = {
    "title": {
      "text": buildTitle(params),
      "style": "{font-size: 16px; color:#515D6B; font-family: Arial,sans-serif; font-weight: bold; text-align: center; margin-top: 5px;}"
    },

    "bg_colour": "#FFFFFF",

    "elements": buildBarChartElements(params, x_labels.labels),

    "x_axis": {
      "colour": gridColors["x-axis"],
      "grid-colour": gridColors["x-grid"],
      "labels": x_labels
    },

    "y_axis": {
      "steps": params.step,
      "colour": gridColors["y-grid"],
      "grid-colour": gridColors["y-grid"],
      "offset": 0,
      "max": params.max + params.max / 10 // Petite marge
    }
  };

  return bars;
}

function buildBarChartElements(params, labels) {
  var elements = [],
    pItems = params.values,
    pItemsLength = pItems.length,
    max = 0,
    values = [],
    label = getMessage("connection", "graph.label.");

  //Boucle sur les �l�ments par date
  for (var i = 0; i < pItemsLength; i++) {
    var item = pItems[i];
    value_obj = {};
    value_obj.top = item;
    value_obj.tip = label + " : " + item; // Voir pour un meilleur label ? Formattage de #val#?
    value_obj.tip += "\n" + labels[i];
    values.push(value_obj);

    max = max > item ? max : item;
  }

  //Mise � jour du max
  //Mise � jour du maximum
  var new_max = max,
    coef = 1;

  if (max == 0) {
    params.max = 9;
    params.step = 1;
  } else {
    while (max > 10) {
      max = max / 10;
      coef = coef * 10;
    }

    new_max = Math.ceil(max);
    //Pas
    params.step = (new_max < 5 && new_max > 1 && coef > 1) ? coef / 2 : coef;
    // Maximum trop importante pour les valeurs proche de 1x ou 2x.
    if (coef > 1) {
      if (max > 1 && max < 1.5) {
        params.max = new_max * coef * 0.75;
      } else if (max > 2 && max < 2.5) {
        params.max = Math.round(new_max * coef * (5 / 6));
      } else {
        params.max = new_max * coef;
      }
    } else {
      params.max = new_max;
      params.step = coef;
    }
  }

  elements.push({
    "type": "bar_glass",
    "alpha": 0.75,
    "colour": barChartColors["users"],
    "text": label,
    "font-size": 10,
    "values": values
  });
  return elements;
}

function buildXAxisLabels(params) {
  var steps = params.values.length >= 30 ? Math.round(params.values.length / 15) : 1;
  var labelConfiguration = {
    "labels": buildBarChartXLabels(params),
    "steps": steps
  }
  addRotation(labelConfiguration, params);
  return labelConfiguration;
}

/**
 * Retourne la traduction du message donn�. Peut �tre prefix�.
 * @method getMessage
 * @param messageId Identifiant du message � traduire
 * @prefix Optionnel - Pr�fixe du message
 */

function getMessage(messageId, prefix) {
  var msg = (prefix) ? prefix + messageId : messageId;
  var res = Alfresco.util.message.call(null, msg, "AtolStatistics.UserConnections", Array.prototype.slice.call(arguments).slice(2));
  res = (res.search("graph.label") == 0) ? messageId : res;
  return res;
}