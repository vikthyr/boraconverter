var currenciesList = null;
var conversionData = null;
var fromCurrencySymbol = null;
var toCurrencySymbol = null;

$(document).ready(function(){

  StartCurrenciesForm();

  $('#from-currency-select').change(function(){
    SetFromCurrencySymbol();
    SetToCurrencySymbol();
    GetRates();
    UpdateCurrencyIcon(fromCurrencySymbol, true);
  });

  $('#to-currency-select').change(function(){
    SetToCurrencySymbol();
    SetToCurrencyInputValue(CalculateConversion());
    UpdateCurrencyIcon(toCurrencySymbol, false);
  });

  $('#from-currency-input').on('input', function () {
    FormatCurrencyInput(this);
    FormatCurrencyInputWithValue($('#to-currency-input').get(0), CalculateConversion());
  });

  $('#to-currency-input').on('input', function () {
    FormatCurrencyInput(this);
    FormatCurrencyInputWithValue($('#from-currency-input').get(0), CalculateConversion(true));
  });
});

function SetCurrenciesList(data){
  currenciesList = data;
}

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
  if(value != 0){
    FormatCurrencyInputWithValue($('#to-currency-input').get(0), value);
    return;
  }

  FormatCurrencyInputWithValue($('#to-currency-input').get(0), 0);
}

function ShowOverlay(element){
  $(element).removeClass("hide");
}

function HideOverlay(element){
  $(element).addClass("hide");
}

function StartCurrenciesForm(){
  const fromCurrencySelect = $('#from-currency-select');
  const fromCurrencySelectParent = $(fromCurrencySelect).parent();
  const toCurrencySelect = $('#to-currency-select');
  const toCurrencySelectParent = $(toCurrencySelect).parent();

  $.ajax({
    url: "/api/currency/listAll",
    method: "GET",
    dataType: "json",
    beforeSend: function(){
      ShowOverlay($('#form-overlay').get(0));
    },
    success: function(data) {
      SetCurrenciesList(data)

      RenderOptions(currenciesList, fromCurrencySelect);
      RenderOptions(currenciesList, toCurrencySelect);

      CreateCurrencyIcon(fromCurrencySelectParent, true);
      CreateCurrencyIcon(toCurrencySelectParent, false);
      
      SetFromCurrencySymbol();
      SetToCurrencySymbol();

      UpdateCurrencyIcon(fromCurrencySymbol, true);
      UpdateCurrencyIcon(toCurrencySymbol, false);
      
      GetRates();
    },
    error: function(error) {
      console.error("Currency search error:", error);
    }
  });
}

function ValidateAndRemoveOptions(data) {
  ['#from-currency-select', '#to-currency-select'].forEach(selector => {
      $(selector).find('option').each(function() {
          if (!data.rates.hasOwnProperty(this.value)) {
              $(this).remove();
          }
      });
  });
}

function CreateCurrencyIcon(selectParentElement, isFrom){
  const currencyIcon = document.createElement('img');
  currencyIcon.id = isFrom ? 'from-currency-icon' : 'to-currency-icon';
  currencyIcon.classList.add('currency-icon');
  selectParentElement.append(currencyIcon);
}

function UpdateCurrencyIcon(currencySymbol, isFrom){
  const imgElement = $(isFrom ? '#from-currency-icon' : '#to-currency-icon');
  $(imgElement).attr('src', `./src/flags/${currencySymbol}.png`);
}

function RenderOptions(currencies, selectElement){
  Object.entries(currencies).forEach(([currencyCode, currencyData]) => {
    const newOption = document.createElement('option');
    newOption.text = `${currencyData.name} (${currencyData.symbol})`;
    newOption.value = `${currencyCode}`;

    if(currencyCode === 'BRL' && $(selectElement).attr('id') == 'from-currency-select'){
      newOption.selected = true;
    }

    selectElement.append(newOption);
  });
}

function GetRates(){
  let loadingOverlay = $('#form-overlay').get(0);

  $.ajax({
    url: `/api/currency/rates?base=${fromCurrencySymbol}`,
    method: "GET",
    beforeSend: function(){
      ShowOverlay(loadingOverlay);
    },
    success: function(data) {
      ValidateAndRemoveOptions(data);
      SetConversionData(data);
      SetToCurrencyInputValue(CalculateConversion());
      HideOverlay(loadingOverlay);
    },
    error: function(error) {
      console.error("Currency rate error:", error);
    }
  });
}

function CalculateConversion(inverted = false) {
  if (!conversionData || !conversionData.rates) return null;

  if (inverted) {
      let toValue = parseFloat($('#to-currency-input').attr('data-raw')) || 0;
      let currencyRate = conversionData.rates[toCurrencySymbol];

      if (!currencyRate || currencyRate === 0) return null;

      let result = toValue / currencyRate;
      return result.toFixed(2);
  }

  let fromValue = parseFloat($('#from-currency-input').attr('data-raw')) || 0;
  let currencyRate = conversionData.rates[toCurrencySymbol];

  if (!currencyRate || currencyRate === 0) return null;

  let result = fromValue * currencyRate;
  return result.toFixed(2);
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