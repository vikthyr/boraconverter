var conversionData = null;
var fromCurrencySymbol = null;
var toCurrencySymbol = null;

$(document).ready(function(){
  $('#from-currency-select').change(function(){
    SetFromCurrencySymbol();
    SetToCurrencySymbol();
    GetRates();
  });

  $('#to-currency-select').change(function(){
    SetToCurrencySymbol();
    SetToCurrencyInputValue(CalculateConversion());
  });

  $('#from-currency-input').on('input', function () {
    FormatCurrencyInput(this);
    FormatCurrencyInputWithValue($('#to-currency-input').get(0), CalculateConversion());
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

function SetToCurrencyInputValue(value){
  if(value){
    $('#to-currency-input').val(value);
    return;
  }

  $('#to-currency-input').val(''); 
}

function StartCurrenciesForm(){
  const fromCurrencySelect = $('#from-currency-select');
  const toCurrencySelect = $('#to-currency-select');

  $.ajax({
    url: "/api/currency/ListAll",
    method: "GET",
    dataType: "json",
    success: function(data) {
      RenderOptions(data, fromCurrencySelect);
      RenderOptions(data, toCurrencySelect);
      SetFromCurrencySymbol();
      SetToCurrencySymbol();
      GetRates();
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

function GetRates(){
  $.ajax({
    url: `/api/currency/Rates?base=${fromCurrencySymbol}`,
    method: "GET",
    success: function(data) {
      SetConversionData(data);
      SetToCurrencyInputValue(CalculateConversion());
    },
    error: function(error) {
      console.error("Currency rate error:", error);
    }
  });
}

function CalculateConversion(){
  let fromValue = parseFloat($('#from-currency-input').attr('data-raw'));
  let currencyRate = conversionData.rates[toCurrencySymbol];
  let result = fromValue * currencyRate;

  if(result){
    return result.toFixed(2);
  }

  return null;
}

function InvertForm(){
  let currencyFromSymbol = fromCurrencySymbol;
  let currencyToSymbol = toCurrencySymbol;

  $('#from-currency-select').val(currencyToSymbol).change();
  $('#to-currency-select').val(currencyFromSymbol).change();

  SetFromCurrencySymbol(currencyToSymbol);
  SetToCurrencySymbol(currencyFromSymbol);
}

function FormatCurrencyInput(input) {
  let value = input.value.replace(/\D/g, '');
  if (value === '') {
      input.value = '';
      return;
  }

  value = parseInt(value, 10).toString();

  while (value.length < 3) {
      value = '0' + value;
  }

  let cents = value.slice(-2);
  let intValue = value.slice(0, -2);
  intValue = intValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); 

  input.value = `${intValue},${cents}`;

  input.dataset.raw = `${intValue.replace(/\./g, '')}.${cents}`;
}

function FormatCurrencyInputWithValue(input, value){
  if (!value) {
      input.value = '';
      return;
  }

  value = (parseFloat(value).toFixed(2)).replace('.', '');

  let cents = value.slice(-2);
  let intValue = value.slice(0, -2);

  intValue = intValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); 

  input.value = `${intValue},${cents}`;

  input.dataset.raw = `${intValue.replace(/\./g, '')}.${cents}`;
}