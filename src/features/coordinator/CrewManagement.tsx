import { festivalService, crewService } from '../../lib/services';
import { Festival, Crew as CrewModel } from '../../lib/types/models';
import { useParams } from 'react-router-dom';
import CheckTableSchema from '../../components/DevHelpers/CheckTableSchema';
import { supabase } from '../../lib/supabaseClient'; 