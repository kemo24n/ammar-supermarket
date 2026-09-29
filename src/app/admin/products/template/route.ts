export function GET() {
  const csv = "﻿" + [
    "sku,name,category,sold_by,price,compare_price,stock,unit,brand,barcode,image,description",
    "AM2001,رز مصري,رز وبقوليات وحبوب,unit,180,200,120,1 كغ,مستورد,,,رز مصري حبة قصيرة",
    "AM2004,بندورة بلدية,خضار وفواكه,weight,70,,150,كغ,سوق الهال,,,السعر للكيلو والكمية بالكيلو",
    "AM2002,زيت دوار الشمس,زيوت وسمون,unit,520,,80,1.8 لتر,,,,",
    "AM2003,لبنة بلدية,ألبان وأجبان وبيض,unit,420,460,40,1 كغ,ألبان حلب,,,",
  ].join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="ammar-products-template.csv"' } });
}
