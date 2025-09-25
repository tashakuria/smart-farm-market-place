# serializer.py
from datetime import datetime
from decimal import Decimal

class SerializerMixin:
    """
    A mixin to add serialization capabilities to SQLAlchemy models
    """
    
    def to_dict(self, exclude=None):
        """
        Convert model instance to dictionary
        """
        exclude = exclude or []
        result = {}
        
        # Get all columns
        for column in self.__table__.columns:
            if column.name not in exclude:
                value = getattr(self, column.name)
                
                # Handle different data types
                if isinstance(value, datetime):
                    result[column.name] = value.isoformat()
                elif isinstance(value, Decimal):
                    result[column.name] = float(value)
                else:
                    result[column.name] = value
        
        return result