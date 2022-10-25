import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
} from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const DaoCard: React.FunctionComponent<{ id: string; name: string }> = ({
  id,
  name,
}) => {
  const navigate = useNavigate();

  const onClick = useCallback(() => {
    navigate(`/daos/${id}`);
  }, [navigate, id]);

  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {name}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={onClick}>
          Details
        </Button>
      </CardActions>
    </Card>
  );
};
