console.log("frontend carregado");
//<script src="./constants.js"></script>

var conversionData = null;
var fromCurrencySymbol = null;
var toCurrencySymbol = null;

$(document).ready(function(){
  $('#from-currency-select').change(function(){
    console.log('mudou from');
    SetFromCurrencySymbol();
    SetToCurrencySymbol();
    
    $.ajax({
      url: `/api/currency/rates?base=${fromCurrencySymbol}`,
      method: "GET",
      success: function(data) {
        SetConversionData(data);
        console.log(fromCurrencySymbol);
        console.log(toCurrencySymbol);
        console.log(fromCurrencySymbol);
        console.log(conversionData);
      },
      error: function(error) {
        console.error("Currency rate error:", error);
      }
    });
  });

  $('#to-currency-select').change(function(){
    console.log('mudou to');
    console.log(conversionData);
    SetToCurrencySymbol();
  });
});

function SetConversionData(data){
  conversionData = data;
}

function SetFromCurrencySymbol(){
    fromCurrencySymbol = $('#from-currency-select').val();
}

function SetToCurrencySymbol(){
  toCurrencySymbol = $('#to-currency-select').val();
}

function StartCurrenciesForm(){
  const fromCurrencySelect = $('#from-currency-select');
  const toCurrencySelect = $('#to-currency-select');

  $.ajax({
    url: "/api/currency/listAll",
    method: "GET",
    dataType: "json",
    success: function(data) {
      RenderOptions(data, fromCurrencySelect);
      RenderOptions(data, toCurrencySelect);
    },
    error: function(error) {
      console.error("Currency search error:", error);
    }
  });
}

function RenderOptions(currencies, selectElement){
  Object.entries(currencies).forEach(([currencyCode, currencyData]) => {
    let newOption = document.createElement('option');
    newOption.text = `${currencyData.name} (${currencyData.symbol})`;
    newOption.value = `${currencyCode}`;

    if(currencyCode === 'BRL' && $(selectElement).attr('id') == 'from-currency-select'){
      newOption.selected = true;
    }

    selectElement.append(newOption);
  });
}





























function CalculateConversion(){
  const fromCurrencySelected = $('#from-currency-select').val();
  const toCurrencySelected = $('#to-currency-select').val();
  const fromCurrencyValue = $('#from-currency-input').val();
  const toCurrencyValue = $('#to-currency-input').val();


  $.ajax({
    url: `/api/calculamoeda?base=${fromCurrencySelected}`,
    method: "GET",
    success: function(data) {
      console.log(data);
      console.log(data.rates[toCurrencySelected]);
    },
    error: function(error) {
      console.error("Erro:", error);
    }
  });


  console.log(fromCurrencySelected);
  console.log(toCurrencySelected);
  console.log(fromCurrencyValue);
  console.log(toCurrencyValue);
}