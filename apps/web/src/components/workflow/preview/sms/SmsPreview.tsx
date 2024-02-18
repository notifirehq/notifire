import styled from '@emotion/styled';
import { colors } from '@novu/design-system';
import { useFormContext, useWatch } from 'react-hook-form';
import { IForm } from '../../../../pages/templates/components/formTypes';
import { useNavigateToStepEditor } from '../../../../pages/templates/hooks/useNavigateToStepEditor';
import { usePreviewSmsTemplate } from '../../../../pages/templates/hooks/usePreviewSmsTemplate';
import { useStepFormPath } from '../../../../pages/templates/hooks/useStepFormPath';
import { useTemplateLocales } from '../../../../pages/templates/hooks/useTemplateLocales';
import { LocaleSelect, MobileSimulator } from '../common';
import { SmsBubble } from './SmsBubble';

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin: auto 1.25rem 2.5rem 1.25rem;
`;

const LocaleSelectStyled = styled(LocaleSelect)`
  .mantine-Select-input {
    color: ${({ theme }) => (theme.colorScheme === 'dark' ? colors.white : colors.B60)};
  }

  .mantine-Input-rightSection {
    color: ${({ theme }) => (theme.colorScheme === 'dark' ? colors.white : colors.B60)} !important;
  }
`;

export const SmsPreview = ({ showPreviewAsLoading = false }: { showPreviewAsLoading?: boolean }) => {
  const { navigateToStepEditor } = useNavigateToStepEditor();

  const { control } = useFormContext<IForm>();
  const path = useStepFormPath();
  const templateContent = useWatch({
    name: `${path}.template.content`,
    control,
  });

  const { selectedLocale, locales, areLocalesLoading, onLocaleChange } = useTemplateLocales({
    content: templateContent as string,
    disabled: false,
  });

  const { isPreviewContentLoading, previewContent, templateContentError } = usePreviewSmsTemplate(
    selectedLocale,
    showPreviewAsLoading
  );

  return (
    <MobileSimulator withBackground={false}>
      <BodyContainer>
        <LocaleSelectStyled
          isLoading={areLocalesLoading}
          locales={locales}
          value={selectedLocale}
          onLocaleChange={onLocaleChange}
          dropdownPosition="top"
        />
        <SmsBubble
          onEditClick={navigateToStepEditor}
          isLoading={isPreviewContentLoading}
          text={previewContent}
          error={templateContentError}
        />
      </BodyContainer>
    </MobileSimulator>
  );
};
