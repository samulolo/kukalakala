from pathlib import Path

import pdfplumber

from exception.app_exceptions import BadRequest


class PdfExtractionService:

    def extract_text(self, file_path : str) -> str:

        pdf_path = Path(file_path)

        if not pdf_path.exists():
            raise BadRequest("O ficheiro PDF não foi encontrado")

        pages_text = []

        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages_text.append(text.strip())

        extracted_text = "\n\n".join(pages_text).strip()

        if not extracted_text:
            raise BadRequest("Não foi possível extrair texto do PDF")

        return extracted_text
