var currenciesList = null;
var conversionData = null;
var fromCurrencySymbol = null;
var toCurrencySymbol = null;

const translations = {
  "Euro": "Euro",
  "US Dollar": "Dólar Americano",
  "Japanese Yen": "Iene Japonês",
  "Bulgarian Lev": "Lev Búlgaro",
  "Czech Koruna": "Coroa Checa",
  "Danish Krone": "Coroa Dinamarquesa",
  "British Pound": "Libra Esterlina",
  "Hungarian Forint": "Florim Húngaro",
  "Polish Zloty": "Złoty Polonês",
  "Romanian Leu": "Leu Romeno",
  "Swedish Krona": "Coroa Sueca",
  "Swiss Franc": "Franco Suíço",
  "Icelandic Króna": "Coroa Islandesa",
  "Norwegian Krone": "Coroa Norueguesa",
  "Croatian Kuna": "Kuna Croata",
  "Russian Ruble": "Rublo Russo",
  "Turkish Lira": "Lira Turca",
  "Australian Dollar": "Dólar Australiano",
  "Brazilian Real": "Real Brasileiro",
  "Canadian Dollar": "Dólar Canadense",
  "Chinese Yuan": "Yuan Chinês",
  "Hong Kong Dollar": "Dólar de Hong Kong",
  "Indonesian Rupiah": "Rupia Indonésia",
  "Israeli New Shekel": "Novo Shekel Israelense",
  "Indian Rupee": "Rúpia Indiana",
  "South Korean Won": "Won Sul-Coreano",
  "Mexican Peso": "Peso Mexicano",
  "Malaysian Ringgit": "Ringgit Malaio",
  "New Zealand Dollar": "Dólar Neozelandês",
  "Philippine Peso": "Peso Filipino",
  "Singapore Dollar": "Dólar de Singapura",
  "Thai Baht": "Baht Tailandês",
  "South African Rand": "Rand Sul-Africano"
};

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
    UpdateConversionDetails();
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
  currencyIcon.classList.add('simple-border');
  selectParentElement.append(currencyIcon);
}

function UpdateCurrencyIcon(currencySymbol, isFrom){
  const imgElement = $(isFrom ? '#from-currency-icon' : '#to-currency-icon');
  $(imgElement).attr('src', `./src/flags/${currencySymbol}.png`);
}

function RenderOptions(currencies, selectElement){
  Object.entries(currencies).forEach(([currencyCode, currencyData]) => {
    const newOption = document.createElement('option');
    const translatedCurrencyName = translations[currencyData.name] || currencyData.name;
    newOption.text = `${translatedCurrencyName} (${currencyCode})`;
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
      UpdateConversionDetails();
    },
    error: function(error) {
      console.error("Currency rate error:", error);
    }
  });
}

function UpdateConversionDetails(){
  const [year, month, day] = conversionData.date.split('-');
  const formattedDate = `${day}/${month}/${year}`;

  const exchangeRate = parseFloat(conversionData.rates[toCurrencySymbol])
    .toFixed(6)
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '');

  $("#conversion-details-date").text(`Data da cotação: ${formattedDate}`);
  $("#conversion-details-result").text(`1 ${fromCurrencySymbol} = ${exchangeRate} ${toCurrencySymbol}`);
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