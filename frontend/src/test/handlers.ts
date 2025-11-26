import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://localhost/api/hello', () => HttpResponse.json({ message: 'hello-test' })),

  http.post('http://localhost/api/insurance/send', () =>
    HttpResponse.text('<xml>placeholder</xml>', {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': 'attachment; filename="insurance.xml"',
      },
    })
  ),
];
