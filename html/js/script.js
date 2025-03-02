console.log("frontend carregado");
<script src="./constants.js"></script>

function StartCurrenciesForm(){
  const fromCurrencySelect = $('#from-currency-select');
  const toCurrencySelect = $('#to-currency-select');

  $.ajax({
    url: "/api/ListAllCurrencies",
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