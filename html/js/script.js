console.log("frontend carregado");

$.ajax({
    url: "/api/calculamoeda?base=BRL",
    method: "GET",
    success: function(data) {
      console.log(data);
      console.log(data.date);
    },
    error: function(error) {
      console.error("Erro:", error);
    }
  });